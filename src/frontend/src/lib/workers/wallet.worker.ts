import {
	queryAndUpdate,
	type QueryAndUpdateOnCertifiedError,
	type QueryAndUpdateOnResponse,
	type QueryAndUpdateRequestParams
} from '$lib/api/call/query.api';
import {
	CYCLES_LEDGER_CANISTER_ID,
	ICP_LEDGER_CANISTER_ID,
	SYNC_WALLET_TIMER_INTERVAL
} from '$lib/constants/app.constants';
import type { IcrcAccountText, LedgerIdText } from '$lib/schemas/wallet.schema';
import type {
	PostMessageDataRequest,
	PostMessageDataResponseError,
	PostMessageDataResponseWallet,
	PostMessageDataResponseWalletCleanUp,
	PostMessageRequest
} from '$lib/types/post-message';
import { loadIdentity } from '$lib/utils/worker.utils';
import {
	requestTransactions,
	type GetTransactionsResponse
} from '$lib/workers/_services/wallet-worker.services';
import { WalletStore, type IndexedTransactions } from '$lib/workers/_stores/wallet-worker.store';
import { isNullish, jsonReplacer } from '@dfinity/utils';
import { decodeIcrcAccount, type IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

export const onWalletMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopWalletTimer':
			stopTimer();
			return;
		case 'startWalletTimer':
			await startTimer({ data });
			return;
		case 'restartWalletTimer':
			stopTimer();
			await startTimer({ data });
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const stopTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

const startTimer = async ({ data: { walletIds } }: { data: PostMessageDataRequest }) => {
	if (isNullish(walletIds)) {
		// No accounts provided
		return;
	}

	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	const ids = walletIds.flatMap((walletId) =>
		[ICP_LEDGER_CANISTER_ID, CYCLES_LEDGER_CANISTER_ID].flatMap((ledgerId) => ({
			walletId,
			ledgerId: Principal.fromText(ledgerId)
		}))
	);

	await Promise.all(
		ids.map(async ({ walletId, ledgerId }) => {
			await startTimerWithAccount({
				identity,
				ledgerId,
				account: decodeIcrcAccount(walletId)
			});
		})
	);
};

const startTimerWithAccount = async ({
	account,
	identity,
	ledgerId
}: {
	account: IcrcAccount;
	identity: Identity;
	ledgerId: Principal;
}) => {
	const store = await WalletStore.init({
		account,
		ledgerId
	});

	emitSavedWallet({ store });

	const sync = async () => await syncWallet({ identity, store });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_WALLET_TIMER_INTERVAL);
};

const syncing: Record<IcrcAccountText, boolean> = {};

let initialized = false;

const syncWallet = async ({ identity, store }: { identity: Identity; store: WalletStore }) => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing[store.idbKey] === true) {
		return;
	}

	syncing[store.idbKey] = true;

	const request = ({
		identity: _,
		certified
	}: QueryAndUpdateRequestParams): Promise<GetTransactionsResponse> =>
		requestTransactions({
			identity,
			certified,
			store
		});

	const onLoad: QueryAndUpdateOnResponse<GetTransactionsResponse> = ({ certified, ...rest }) => {
		syncTransactions({ certified, store, ...rest });
		cleanTransactions({ certified, store });
	};

	const onCertifiedError: QueryAndUpdateOnCertifiedError = ({ error }) => {
		store.reset();

		postMessageWalletError(error);

		stopTimer();
	};

	await queryAndUpdate<GetTransactionsResponse>({
		request,
		onLoad,
		onCertifiedError,
		identity,
		resolution: 'all_settled'
	});

	await store.save();

	syncing[store.idbKey] = false;
};

const postMessageWallet = ({
	certified,
	icrcAccountText,
	ledgerIdText,
	balance,
	transactions: newTransactions
}: GetTransactionsResponse & {
	icrcAccountText: IcrcAccountText;
	ledgerIdText: LedgerIdText;
	certified: boolean;
}) => {
	const certifiedTransactions = newTransactions.map((data) => ({ data, certified }));

	const data: PostMessageDataResponseWallet = {
		wallet: {
			walletId: icrcAccountText,
			ledgerId: ledgerIdText,
			balance: {
				data: balance,
				certified
			},
			newTransactions: JSON.stringify(certifiedTransactions, jsonReplacer)
		}
	};

	postMessage({
		msg: 'syncWallet',
		data
	});
};

const syncTransactions = ({
	response: { transactions: fetchedTransactions, balance, ...rest },
	certified,
	store
}: {
	response: GetTransactionsResponse;
	certified: boolean;
	store: WalletStore;
}) => {
	// Is there any new transactions unknown so far or which has become certified
	const newTransactions = fetchedTransactions.filter(
		({ id }) => isNullish(store.transactions[`${id}`]) || !store.transactions[`${id}`].certified
	);

	// Is the balance different from last value or has it become certified
	const newBalance =
		isNullish(store.balance) ||
		store.balance.data !== balance ||
		(!store.balance.certified && certified);

	if (newTransactions.length === 0 && !newBalance) {
		// We execute postMessage at least once because developer may have no transaction at all so, we want to display the balance zero
		if (!initialized) {
			postMessageWallet({
				icrcAccountText: store.icrcAccountText,
				ledgerIdText: store.ledgerIdText,
				transactions: [],
				balance,
				certified,
				...rest
			});

			initialized = true;
		}

		return;
	}

	store.update({ balance, newTransactions, certified });

	postMessageWallet({
		icrcAccountText: store.icrcAccountText,
		ledgerIdText: store.ledgerIdText,
		transactions: newTransactions,
		balance,
		certified,
		...rest
	});

	// If we have sent at least one postMessage we can consider the worker has being initialized.
	initialized = true;
};

/**
 * For security reason, everytime we get an update results we check if there are remaining transactions not certified in memory.
 * If we find some, we prune those. Given that we are fetching transactions every X seconds, there should not be any query in memory when update calls have been resolved.
 */
const cleanTransactions = ({ certified, store }: { certified: boolean; store: WalletStore }) => {
	if (!certified) {
		return;
	}

	const [certifiedTransactions, notCertifiedTransactions] = Object.entries(
		store.transactions
	).reduce(
		([certified, notCertified]: [IndexedTransactions, IndexedTransactions], [key, data]) => [
			{
				...certified,
				...(data.certified && { [key]: data })
			},
			{
				...notCertified,
				...(!data.certified && { [key]: data })
			}
		],
		[{}, {}]
	);

	if (Object.keys(notCertifiedTransactions).length === 0) {
		// No not certified found.
		return;
	}

	postMessageWalletCleanUp({ transactions: notCertifiedTransactions, store });

	store.clean(certifiedTransactions);
};

const postMessageWalletCleanUp = ({
	transactions,
	store
}: {
	transactions: IndexedTransactions;
	store: WalletStore;
}) => {
	const data: PostMessageDataResponseWalletCleanUp = {
		walletId: store.icrcAccountText,
		ledgerId: store.ledgerIdText,
		transactionIds: Object.keys(transactions)
	};

	postMessage({
		msg: 'syncWalletCleanUp',
		data
	});
};

const postMessageWalletError = (error: unknown) => {
	const data: PostMessageDataResponseError = {
		error
	};

	postMessage({
		msg: 'syncWalletError',
		data
	});
};

const emitSavedWallet = ({ store }: { store: WalletStore }) => {
	if (isNullish(store.balance)) {
		return;
	}

	const uiTransactions = Object.values(store.transactions).sort(
		({ data: { id: idA } }, { data: { id: idB } }) => Number(idB) - Number(idA)
	);

	const data: PostMessageDataResponseWallet = {
		wallet: {
			walletId: store.icrcAccountText,
			ledgerId: store.ledgerIdText,
			balance: store.balance,
			newTransactions: JSON.stringify(uiTransactions, jsonReplacer)
		}
	};

	postMessage({
		msg: 'syncWallet',
		data
	});
};

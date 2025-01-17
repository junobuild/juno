import {
	queryAndUpdate,
	type QueryAndUpdateOnCertifiedError,
	type QueryAndUpdateOnResponse,
	type QueryAndUpdateRequestParams
} from '$lib/api/call/query.api';
import { getTransactions } from '$lib/api/icp-index.api';
import { PAGINATION, SYNC_WALLET_TIMER_INTERVAL } from '$lib/constants/constants';
import type { IcTransactionUi } from '$lib/types/ic-transaction';
import type {
	PostMessageDataRequest,
	PostMessageDataResponseError,
	PostMessageDataResponseWallet,
	PostMessageDataResponseWalletCleanUp,
	PostMessageRequest
} from '$lib/types/post-message';
import { mapIcpTransaction } from '$lib/utils/icp-transactions.utils';
import { loadIdentity } from '$lib/utils/worker.utils';
import { type IndexedTransactions, WalletStore } from '$lib/workers/_stores/wallet-worker.store';
import type { Identity } from '@dfinity/agent';
import type { GetAccountIdentifierTransactionsResponse } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import { isNullish, jsonReplacer } from '@dfinity/utils';

export const onWalletMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopWalletTimer':
			stopTimer();
			return;
		case 'startWalletTimer':
			await startTimer({ data });
			return;
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

const startTimer = async ({ data: { missionControlId } }: { data: PostMessageDataRequest }) => {
	if (isNullish(missionControlId)) {
		// No mission control ID provided
		return;
	}

	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	const store = await WalletStore.init();

	emitSavedWallet({ store, identity });

	const sync = async () => await syncWallet({ missionControlId, identity, store });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_WALLET_TIMER_INTERVAL);
};

let syncing = false;

let initialized = false;

const syncWallet = async ({
	missionControlId,
	identity,
	store
}: {
	missionControlId: string;
	identity: Identity;
	store: WalletStore;
}) => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	syncing = true;

	const request = ({
		identity: _,
		certified
	}: QueryAndUpdateRequestParams): Promise<GetAccountIdentifierTransactionsResponse> =>
		getTransactions({
			identity,
			owner: Principal.fromText(missionControlId),
			// We query tip to discover the new transactions
			start: undefined,
			maxResults: PAGINATION,
			certified
		});

	const onLoad: QueryAndUpdateOnResponse<GetAccountIdentifierTransactionsResponse> = ({
		certified,
		...rest
	}) => {
		syncTransactions({ certified, identity, store, ...rest });
		cleanTransactions({ certified, store });
	};

	const onCertifiedError: QueryAndUpdateOnCertifiedError = ({ error }) => {
		store.reset();

		postMessageWalletError(error);

		stopTimer();
	};

	await queryAndUpdate<GetAccountIdentifierTransactionsResponse>({
		request,
		onLoad,
		onCertifiedError,
		identity,
		resolution: 'all_settled'
	});

	await store.save();

	syncing = false;
};

const postMessageWallet = ({
	certified,
	balance,
	transactions: newTransactions
}: Pick<GetAccountIdentifierTransactionsResponse, 'balance'> & {
	transactions: IcTransactionUi[];
} & {
	certified: boolean;
}) => {
	const certifiedTransactions = newTransactions.map((data) => ({ data, certified }));

	const data: PostMessageDataResponseWallet = {
		wallet: {
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
	identity,
	store
}: {
	response: GetAccountIdentifierTransactionsResponse;
	certified: boolean;
	identity: Identity;
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

	const newUiTransactions = newTransactions.map((transaction) =>
		mapIcpTransaction({ transaction, identity })
	);

	postMessageWallet({
		transactions: newUiTransactions,
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

	postMessageWalletCleanUp(notCertifiedTransactions);

	store.clean(certifiedTransactions);
};

const postMessageWalletCleanUp = (transactions: IndexedTransactions) => {
	const data: PostMessageDataResponseWalletCleanUp = {
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

const emitSavedWallet = ({ store, identity }: { store: WalletStore; identity: Identity }) => {
	if (isNullish(store.balance)) {
		return;
	}

	const uiTransactions = Object.values(store.transactions)
		.sort(({ data: { id: idA } }, { data: { id: idB } }) => Number(idB) - Number(idA))
		.map(({ certified, data: transaction }) => ({
			certified,
			data: mapIcpTransaction({ transaction, identity })
		}));

	const data: PostMessageDataResponseWallet = {
		wallet: {
			balance: store.balance,
			newTransactions: JSON.stringify(uiTransactions, jsonReplacer)
		}
	};

	console.log('init', uiTransactions);

	postMessage({
		msg: 'syncWallet',
		data
	});
};

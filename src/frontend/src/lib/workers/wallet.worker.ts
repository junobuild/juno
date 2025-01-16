import {
	queryAndUpdate,
	type QueryAndUpdateOnCertifiedError,
	type QueryAndUpdateOnResponse,
	type QueryAndUpdateRequestParams
} from '$lib/api/call/query.api';
import { getTransactions } from '$lib/api/icp-index.api';
import { PAGINATION, SYNC_WALLET_TIMER_INTERVAL } from '$lib/constants/constants';
import type { IcTransactionAddOnsInfo, IcTransactionUi } from '$lib/types/ic-transaction';
import type {
	PostMessageDataRequest,
	PostMessageDataResponseError,
	PostMessageDataResponseWallet,
	PostMessageDataResponseWalletCleanUp,
	PostMessageRequest
} from '$lib/types/post-message';
import type { CertifiedData } from '$lib/types/store';
import { mapIcpTransaction, mapTransactionIcpToSelf } from '$lib/utils/icp-transactions.utils';
import { loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import type { GetAccountIdentifierTransactionsResponse, Transaction } from '@dfinity/ledger-icp';
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

	const sync = async () => await syncWallet({ missionControlId, identity });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_WALLET_TIMER_INTERVAL);
};

let syncing = false;

let initialized = false;

// Not reactive, only used to hold values imperatively.
interface IcWalletStore {
	balance: CertifiedData<bigint> | undefined;
	transactions: IndexedTransactions;
}

type IndexedTransaction = Transaction & IcTransactionAddOnsInfo;

type IndexedTransactions = Record<string, CertifiedData<IndexedTransaction>>;

let store: IcWalletStore = {
	balance: undefined,
	transactions: {}
};

const syncWallet = async ({
	missionControlId,
	identity
}: {
	missionControlId: string;
	identity: Identity;
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
		syncTransactions({ certified, identity, ...rest });
		cleanTransactions({ certified });
	};

	const onCertifiedError: QueryAndUpdateOnCertifiedError = ({ error }) => {
		postMessageWalletError(error);

		console.error(error);
		stopTimer();
	};

	await queryAndUpdate<GetAccountIdentifierTransactionsResponse>({
		request,
		onLoad,
		onCertifiedError,
		identity,
		resolution: 'all_settled'
	});

	syncing = false;
};

const postMessageWallet = ({
	certified,
	balance,
	transactions: newTransactions,
	...rest
}: Omit<GetAccountIdentifierTransactionsResponse, 'transactions'> & {
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
			...rest,
			newTransactions: JSON.stringify(
				Object.entries(certifiedTransactions).map(([_id, transaction]) => transaction),
				jsonReplacer
			)
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
	identity
}: {
	response: GetAccountIdentifierTransactionsResponse;
	certified: boolean;
	identity: Identity;
}) => {
	// Is there any new transactions unknown so far or which has become certified
	const newTransactions = fetchedTransactions.filter(
		({ id }) => isNullish(store.transactions[`${id}`]) || !store.transactions[`${id}`].certified
	);

	const newExtendedTransactions = newTransactions.flatMap(mapTransactionIcpToSelf);

	// Is the balance different from last value or has it become certified
	const newBalance =
		isNullish(store.balance) ||
		store.balance.data !== balance ||
		(!store.balance.certified && certified);

	if (newExtendedTransactions.length === 0 && !newBalance) {
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

	store = {
		balance: { data: balance, certified },
		transactions: {
			...store.transactions,
			...newExtendedTransactions.reduce(
				(acc: Record<string, CertifiedData<IndexedTransaction>>, { id, transaction }) => ({
					...acc,
					[`${id}`]: {
						data: transaction,
						certified
					}
				}),
				{}
			)
		}
	};

	const newUiTransactions = newExtendedTransactions.map((transaction) =>
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
const cleanTransactions = ({ certified }: { certified: boolean }) => {
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

	store = {
		...store,
		transactions: {
			...certifiedTransactions
		}
	};
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

import { getTransactions } from '$lib/api/icp-index.api';
import { PAGINATION, SYNC_WALLET_TIMER_INTERVAL } from '$lib/constants/constants';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import type {
	GetAccountIdentifierTransactionsResponse,
	Transaction,
	TransactionWithId
} from '@dfinity/ledger-icp';
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

let transactions: Record<string, Transaction> = {};
let initialized = false;

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

	try {
		const { transactions: fetchedTransactions, ...rest } = await getTransactions({
			identity,
			owner: Principal.fromText(missionControlId),
			// We query tip to discover the new transactions
			start: undefined,
			maxResults: PAGINATION
		});

		const newTransactions = fetchedTransactions.filter(
			({ id }: TransactionWithId) => !Object.keys(transactions).includes(`${id}`)
		);

		if (newTransactions.length === 0) {
			// No new transactions
			syncing = false;

			// We execute postMessage at least once because developer may have no transaction at all so, we want to display the balance zero
			if (!initialized) {
				postMessageWallet({ transactions: newTransactions, ...rest });

				initialized = true;
			}

			return;
		}

		transactions = {
			...transactions,
			...newTransactions.reduce(
				(acc: Record<string, Transaction>, { id, transaction }: TransactionWithId) => ({
					...acc,
					[`${id}`]: transaction
				}),
				{}
			)
		};

		postMessageWallet({ transactions: newTransactions, ...rest });
	} catch (err: unknown) {
		console.error(err);
		stopTimer();
	}

	syncing = false;
};

const postMessageWallet = ({
	transactions: newTransactions,
	...rest
}: GetAccountIdentifierTransactionsResponse) =>
	postMessage({
		msg: 'syncWallet',
		data: {
			wallet: {
				...rest,
				newTransactions: JSON.stringify(
					Object.entries(newTransactions).map(([_id, transaction]) => transaction),
					jsonReplacer
				)
			}
		}
	});

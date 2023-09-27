import { getTransactions } from '$lib/api/ledger.api';
import { SYNC_LEDGER_TRANSACTIONS_TIMER_INTERVAL } from '$lib/constants/constants';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { loadIdentity } from '$lib/utils/agent.utils';
import { isNullish, last } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { TransactionWithId, Transaction } from '@junobuild/ledger';

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopLedgerTransactionsTimer':
			stopTimer();
			return;
		case 'startLedgerTransactionsTimer':
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

	const sync = async () => await syncTransactions({ missionControlId, identity });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_LEDGER_TRANSACTIONS_TIMER_INTERVAL);
};

let syncing = false;

let transactions: Record<string, Transaction> = {};
let start: bigint | undefined = undefined;
let maxResults = 2n;

const syncTransactions = async ({
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
			start,
			maxResults
		});

		const newTransactions = fetchedTransactions.filter(
			({ id }) => id !== transactions?.[id]
		);

		console.log(newTransactions)

		if (newTransactions.length === 0) {
			// No new transactions
			return;
		}

		start = last(newTransactions.sort(({ id: idA, id: idB }) => (idA > idB ? -1 : 1)))?.id;

		// start = isNullish(oldest) ? undefined : oldest - maxResults;

		console.log(start, newTransactions);

		transactions = {
			...transactions,
			...newTransactions.reduce((acc, {id, transaction}) => ({
				...acc,
				[id]: transaction
			}), {})
		};

		console.log('store', transactions);

		// TODO: postMessage
	} catch (err: unknown) {
		console.error(err);
		stopTimer();
	}

	syncing = false;
};

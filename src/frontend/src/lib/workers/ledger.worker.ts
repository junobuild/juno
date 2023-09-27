import { getTransactions } from '$lib/api/ledger.api';
import { SYNC_LEDGER_TRANSACTIONS_TIMER_INTERVAL } from '$lib/constants/constants';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { loadIdentity } from '$lib/utils/agent.utils';
import { isNullish } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

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
		const results = await getTransactions({
			identity,
			owner: Principal.fromText(missionControlId)
		});

		// TODO: postMessage
		console.log(results);
	} catch (err: unknown) {
		console.error(err);
		stopTimer();
	}

	syncing = false;
};

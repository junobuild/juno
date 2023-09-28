import { getTransactions } from '$lib/api/ledger.api';
import { PAGINATION, SYNC_LEDGER_TRANSACTIONS_TIMER_INTERVAL } from '$lib/constants/constants';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { loadIdentity } from '$lib/utils/agent.utils';
import { isNullish } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { jsonReplacer } from '@dfinity/utils';
import type { Transaction } from '@junobuild/ledger';

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
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

	timer = setInterval(sync, SYNC_LEDGER_TRANSACTIONS_TIMER_INTERVAL);
};

let syncing = false;

let transactions: Record<string, Transaction> = {};

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
			({ id }: Transaction) => !Object.keys(transactions).includes(`${id}`)
		);

		if (newTransactions.length === 0) {
			// No new transactions
			syncing = false;
			return;
		}

		transactions = {
			...transactions,
			...newTransactions.reduce(
				(acc: Record<string, Transaction>, { id, transaction }: Transaction) => ({
					...acc,
					[`${id}`]: transaction
				}),
				{}
			)
		};

		postMessage({
			msg: 'syncWallet',
			data: {
				wallet: {
					...rest,
					newTransactions: JSON.stringify(
						Object.entries(newTransactions).map(([id, transaction]) => transaction),
						jsonReplacer
					)
				}
			}
		});
	} catch (err: unknown) {
		console.error(err);
		stopTimer();
	}

	syncing = false;
};

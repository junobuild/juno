import { icpXdrConversionRate } from '$lib/api/cmc.api';
import { canisterStatus } from '$lib/api/ic.api';
import { CYCLES_WARNING, SYNC_CYCLES_TIMER_INTERVAL } from '$lib/constants/constants';
import type { Canister, CanisterInfo } from '$lib/types/canister';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { cyclesToICP } from '$lib/utils/cycles.utils';
import { isNullish } from '$lib/utils/utils';
import { loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { createStore, getMany, set } from 'idb-keyval';

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopCyclesTimer':
			stopCyclesTimer();
			return;
		case 'startCyclesTimer':
			await startCyclesTimer({ data });
			return;
		case 'restartCyclesTimer':
			stopCyclesTimer();
			await startCyclesTimer({ data });
			return;
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const startCyclesTimer = async ({ data: { canisterIds } }: { data: PostMessageDataRequest }) => {
	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	const sync = async () => await syncCanisters({ identity, canisterIds: canisterIds ?? [] });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_CYCLES_TIMER_INTERVAL);
};

const stopCyclesTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

const customStore = createStore('juno-db', 'juno-cycles-store');

let syncing = false;

const syncCanisters = async ({
	identity,
	canisterIds
}: {
	identity: Identity;
	canisterIds: string[];
}) => {
	if (canisterIds.length === 0) {
		// No canister to sync
		return;
	}

	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	await emitSavedCanisters({ canisterIds });

	try {
		const trillionRatio: bigint = await icpXdrConversionRate();

		await syncNnsCanisters({ identity, canisterIds, trillionRatio });
	} finally {
		syncing = false;
	}
};

const syncNnsCanisters = async ({
	identity,
	canisterIds,
	trillionRatio
}: {
	identity: Identity;
	canisterIds: string[];
	trillionRatio: bigint;
}) => {
	await Promise.allSettled(
		canisterIds.map(async (canisterId: string) => {
			try {
				const canisterInfo: CanisterInfo = await canisterStatus({ canisterId, identity });

				await syncCanister({
					canisterInfo,
					trillionRatio,
					canisterId: canisterInfo.canisterId
				});
			} catch (err: unknown) {
				console.error(err);

				emitCanister({
					id: canisterId,
					sync: 'error'
				});

				throw err;
			}
		})
	);
};

// Update ui with one canister information
const emitCanister = (canister: Canister) =>
	postMessage({
		msg: 'syncCanister',
		data: {
			canister
		}
	});

const syncCanister = async ({
	canisterId,
	trillionRatio,
	canisterInfo: { cycles, status, memory_size, idle_cycles_burned_per_day }
}: {
	canisterId: string;
	trillionRatio: bigint;
	canisterInfo: CanisterInfo;
}) => {
	const canister: Canister = {
		id: canisterId,
		sync: 'synced',
		data: {
			status,
			memory_size,
			idle_cycles_burned_per_day,
			cycles,
			icp: cyclesToICP({ cycles, trillionRatio }),
			warning: cycles < CYCLES_WARNING
		}
	};

	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(canisterId, canister, customStore);

	emitCanister(canister);
};

const emitSavedCanisters = async ({ canisterIds }: { canisterIds: string[] }) => {
	const canisters = (await getMany(canisterIds, customStore))
		.filter((canister: Canister | undefined) => canister !== undefined)
		.map((canister) => ({
			...canister,
			sync: 'syncing'
		}));

	const canistersNeverSynced: Canister[] = canisterIds
		.filter((id) => canisters.find(({ syncedId }) => id === syncedId) === undefined)
		.map((id) => ({
			id,
			sync: 'loading'
		}));

	await Promise.all(canistersNeverSynced.map(emitCanister));

	await Promise.all(canisters.map(emitCanister));
};

import { icpXdrConversionRate } from '$lib/api/cmc.api';
import { canisterStatus } from '$lib/api/ic.api';
import {
	CYCLES_WARNING,
	MEMORY_HEAP_WARNING,
	SYNC_CYCLES_TIMER_INTERVAL
} from '$lib/constants/app.constants';
import { ONE_YEAR, THREE_MONTHS } from '$lib/constants/canister.constants';
import { cyclesIdbStore } from '$lib/stores/idb.store';
import type { CanisterInfo, CanisterSegment, CanisterSyncData, Segment } from '$lib/types/canister';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { cyclesToICP } from '$lib/utils/cycles.utils';
import {
	emitCanister,
	emitCanisters,
	emitSavedCanisters,
	loadIdentity
} from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { isNullish } from '@dfinity/utils';
import { set } from 'idb-keyval';

export const onCyclesMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
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

const startCyclesTimer = async ({ data: { segments } }: { data: PostMessageDataRequest }) => {
	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	const sync = async () => await syncCanisters({ identity, segments: segments ?? [] });

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

let syncing = false;

const syncCanisters = async ({
	identity,
	segments
}: {
	identity: Identity;
	segments: CanisterSegment[];
}) => {
	if (segments.length === 0) {
		// No canister to sync
		return;
	}

	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	syncing = true;

	await emitSavedCanisters({
		canisterIds: segments.map(({ canisterId }) => canisterId),
		customStore: cyclesIdbStore
	});

	try {
		const trillionRatio: bigint = await icpXdrConversionRate();

		await syncIcStatusCanisters({ identity, segments, trillionRatio });
	} finally {
		syncing = false;
	}
};

const syncIcStatusCanisters = async ({
	identity,
	segments,
	trillionRatio
}: {
	identity: Identity;
	segments: CanisterSegment[];
	trillionRatio: bigint;
}) => {
	const syncStatusAndMemoryPerCanister = async ({
		canisterId,
		segment
	}: CanisterSegment): Promise<CanisterSyncData> => {
		try {
			const canisterInfo = await canisterStatus({ canisterId, identity });

			const canister = mapCanisterSyncData({
				canisterInfo,
				trillionRatio,
				canisterId: canisterInfo.canisterId,
				segment
			});

			// We emit the canister data this way the UI can render asynchronously render the information without waiting for all canisters status to be fetched.
			emitCanister(canister);

			return canister;
		} catch (err: unknown) {
			console.error(err);

			return {
				id: canisterId,
				sync: 'error'
			};
		}
	};

	const canisters = await Promise.all(segments.map(syncStatusAndMemoryPerCanister));

	// Save information in indexed-db as well to load previous values on navigation and refresh
	for (const { id, ...rest } of canisters.filter(({ sync }) => sync !== 'error')) {
		await set(id, { id, ...rest }, cyclesIdbStore);
	}

	// We also emits all canisters status for syncing the potential errors but also to hold the value in the UI in a stores that gets updated in bulk and lead to less re-render
	emitCanisters(canisters);
};

const mapCanisterSyncData = ({
	canisterId,
	trillionRatio,
	segment,
	canisterInfo: { canisterId: _, memoryMetrics, cycles, settings, ...rest }
}: {
	canisterId: string;
	trillionRatio: bigint;
	canisterInfo: CanisterInfo;
	segment: Segment;
}): CanisterSyncData => ({
	id: canisterId,
	sync: 'synced',
	data: {
		icp: cyclesToICP({ cycles, trillionRatio }),
		warning: {
			cycles: cycles < CYCLES_WARNING,
			heap: (memoryMetrics.wasmMemorySize ?? 0n) >= MEMORY_HEAP_WARNING,
			freezingThreshold:
				settings.freezingThreshold < BigInt(segment === 'orbiter' ? THREE_MONTHS : ONE_YEAR)
		},
		canister: {
			cycles,
			memoryMetrics,
			settings,
			...rest
		}
	}
});

import {
	queryAndUpdate,
	type QueryAndUpdateOnCertifiedError,
	type QueryAndUpdateOnResponse,
	type QueryAndUpdateRequestParams
} from '$lib/api/call/query.api';
import { canisterStatus } from '$lib/api/ic.api';
import {
	CYCLES_WARNING,
	MEMORY_HEAP_WARNING,
	SYNC_CYCLES_TIMER_INTERVAL
} from '$lib/constants/app.constants';
import { ONE_YEAR, THREE_MONTHS } from '$lib/constants/canister.constants';
import { cyclesIdbStore } from '$lib/stores/app/idb.store';
import type { CanisterInfo, CanisterSegment, CanisterSyncData, Segment } from '$lib/types/canister';
import type { PostMessageDataRequest, PostMessageRequest } from '$lib/types/post-message';
import { emitCanisters, emitSavedCanisters, loadIdentity } from '$lib/utils/worker.utils';
import { CanistersStore } from '$lib/workers/_stores/canisters.store';
import { isNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
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
		await syncIcStatusCanisters({ identity, segments });
	} finally {
		syncing = false;
	}
};

const syncIcStatusCanisters = async ({
	identity,
	segments
}: {
	identity: Identity;
	segments: CanisterSegment[];
}) => {
	const canistersStore = new CanistersStore();

	const syncStatusAndMemoryPerCanister = async ({
		canisterId,
		segment
	}: CanisterSegment): Promise<void> => {
		const request = ({
			identity: _,
			certified
		}: QueryAndUpdateRequestParams): Promise<CanisterInfo> =>
			canisterStatus({ canisterId, identity, certified });

		const onLoad: QueryAndUpdateOnResponse<CanisterInfo> = ({
			certified,
			response: canisterInfo
		}) => {
			const canister = mapCanisterSyncData({
				canisterInfo,
				canisterId,
				segment
			});

			canistersStore.sync({ canisterId, data: { data: canister, certified } });
		};

		const onCertifiedError: QueryAndUpdateOnCertifiedError = ({ error }) => {
			console.error(error);

			canistersStore.set({
				canisterId,
				data: {
					data: {
						id: canisterId,
						sync: 'error'
					},
					certified: false
				}
			});
		};

		await queryAndUpdate<CanisterInfo>({
			request,
			onLoad,
			onCertifiedError,
			identity,
			resolution: 'all_settled'
		});
	};

	await Promise.all(segments.map(syncStatusAndMemoryPerCanister));

	const canisters = canistersStore.getValues();

	// Save information in indexed-db as well to load previous values on navigation and refresh
	for (const {
		data: { id, ...rest }
	} of canisters.filter(({ data: { sync } }) => sync !== 'error')) {
		await set(id, { id, ...rest }, cyclesIdbStore);
	}

	// We also emits all canisters status for syncing the potential errors but also to hold the value in the UI in a stores that gets updated in bulk and lead to less re-render
	emitCanisters(canisters);
};

const mapCanisterSyncData = ({
	canisterId,
	segment,
	canisterInfo: { canisterId: _, memoryMetrics, cycles, settings, ...rest }
}: {
	canisterId: string;
	canisterInfo: CanisterInfo;
	segment: Segment;
}): CanisterSyncData => ({
	id: canisterId,
	sync: 'synced',
	data: {
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

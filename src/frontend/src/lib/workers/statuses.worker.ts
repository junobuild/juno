import {
	listMissionControlStatuses,
	listOrbiterStatuses,
	listSatelliteStatuses
} from '$lib/api/mission-control.api';
import { SYNC_STATUSES_TIMER_INTERVAL } from '$lib/constants/constants';
import type { CanisterJunoStatus } from '$lib/types/canister';
import type { ChartsData } from '$lib/types/chart';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { formatTCycles } from '$lib/utils/cycles.utils';
import { fromBigIntNanoSeconds } from '$lib/utils/date.utils';
import { emitCanister, emitSavedCanisters, loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish } from '@dfinity/utils';
import { startOfDay } from 'date-fns';
import { createStore, set } from 'idb-keyval';

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopStatusesTimer':
			stopStatusesTimer();
			return;
		case 'startStatusesTimer':
			await startStatusesTimer({ data });
			return;
		case 'restartStatusesTimer':
			stopStatusesTimer();
			await startStatusesTimer({ data });
			return;
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const startStatusesTimer = async ({
	data: { segments, missionControlId }
}: {
	data: PostMessageDataRequest;
}) => {
	const identity = await loadIdentity();

	if (isNullish(identity)) {
		// We do nothing if no identity
		return;
	}

	if (isNullish(missionControlId)) {
		// We need a mission control ID
		console.error('No mission control ID set to fetch the statuses of the segments.');
		return;
	}

	const sync = async () =>
		await syncStatuses({ identity, segments: segments ?? [], missionControlId });

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_STATUSES_TIMER_INTERVAL);
};

const stopStatusesTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

const customStore = createStore('juno-statuses', 'juno-statuses-store');

let syncing = false;

const syncStatuses = async ({
	identity,
	segments,
	missionControlId
}: {
	identity: Identity;
} & Required<Pick<PostMessageDataRequest, 'missionControlId' | 'segments'>>) => {
	if (segments.length === 0) {
		// No canister to sync
		return;
	}

	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	await emitSavedCanisters({
		canisterIds: segments.map(({ canisterId }) => canisterId),
		customStore
	});

	try {
		await syncJunoStatusesCanisters({ identity, segments, missionControlId });
	} finally {
		syncing = false;
	}
};

const syncJunoStatusesCanisters = async ({
	identity,
	segments,
	missionControlId
}: {
	identity: Identity;
} & Required<Pick<PostMessageDataRequest, 'missionControlId' | 'segments'>>) => {
	await Promise.allSettled(
		segments.map(async ({ canisterId, segment }) => {
			try {
				const results = await (segment === 'satellite'
					? listSatelliteStatuses({
							satelliteId: Principal.fromText(canisterId),
							missionControlId: Principal.fromText(missionControlId),
							identity
						})
					: segment === 'orbiter'
						? listOrbiterStatuses({
								orbiterId: Principal.fromText(canisterId),
								missionControlId: Principal.fromText(missionControlId),
								identity
							})
						: listMissionControlStatuses({
								missionControlId: Principal.fromText(missionControlId),
								identity
							}));

				const chartsStatuses = (fromNullable(results) ?? [])
					.map(([timestamp, result]) => {
						if ('Err' in result) {
							return {
								x: `${fromBigIntNanoSeconds(timestamp).getTime()}`,
								y: 0
							};
						}

						const {
							Ok: {
								status: { cycles }
							}
						} = result;

						return {
							x: `${fromBigIntNanoSeconds(timestamp).getTime()}`,
							y: parseFloat(formatTCycles(cycles))
						};
					})
					.sort(({ x: aKey }, { x: bKey }) => parseInt(aKey) - parseInt(bKey));

				const totalStatusesPerDay = chartsStatuses.reduce<Record<string, number[]>>(
					(acc, { x, y }) => {
						const date = new Date(parseInt(x));
						const key = startOfDay(date).getTime();

						return {
							...acc,
							[key]: [...(acc[key] ?? []), y]
						};
					},
					{}
				);

				const chartsData = Object.entries(totalStatusesPerDay).map(([key, values]) => ({
					x: key,
					y: values.reduce((acc, value) => acc + value, 0) / values.length
				}));

				await syncCanister({
					canisterId,
					chartsData
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

const syncCanister = async ({
	canisterId,
	chartsData
}: {
	canisterId: string;
	chartsData: ChartsData[];
}) => {
	const canister: CanisterJunoStatus = {
		id: canisterId,
		sync: 'synced',
		data: {
			chartsData
		}
	};

	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(canisterId, canister, customStore);

	emitCanister(canister);
};

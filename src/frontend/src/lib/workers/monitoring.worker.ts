import {
	getMonitoringHistory,
	listMissionControlStatuses,
	listOrbiterStatuses,
	listSatelliteStatuses
} from '$lib/api/mission-control.api';
import { SYNC_MONITORING_TIMER_INTERVAL } from '$lib/constants/constants';
import { monitoringHistoryIdbStore, statusesIdbStore } from '$lib/stores/idb.store';
import type { CanisterSegment, CanisterSyncMonitoring } from '$lib/types/canister';
import type { ChartsData } from '$lib/types/chart';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { formatTCycles } from '$lib/utils/cycles.utils';
import { fromBigIntNanoSeconds } from '$lib/utils/date.utils';
import { emitCanister, emitSavedCanisters, loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { startOfDay } from 'date-fns';
import { get, set } from 'idb-keyval';
import type {MonitoringHistory} from "$lib/types/monitoring";

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	const { msg, data } = dataMsg;

	switch (msg) {
		case 'stopMonitoringTimer':
			stopMonitoringTimer();
			return;
		case 'startMonitoringTimer':
			await startMonitoringTimer({ data });
			return;
		case 'restartMonitoringTimer':
			stopMonitoringTimer();
			await startMonitoringTimer({ data });
			return;
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const startMonitoringTimer = async ({
	data: { segments, missionControlId, withMonitoringHistory }
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
		console.error('No mission control ID set to fetch the monitoring history of the segments.');
		return;
	}

	const sync = async () =>
		await syncMonitoring({
			identity,
			segments: segments ?? [],
			missionControlId,
			withMonitoringHistory: withMonitoringHistory ?? false
		});

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_MONITORING_TIMER_INTERVAL);
};

const stopMonitoringTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

let syncing = false;

const syncMonitoring = async ({
	identity,
	segments,
	...rest
}: {
	identity: Identity;
} & Required<
	Pick<PostMessageDataRequest, 'missionControlId' | 'segments' | 'withMonitoringHistory'>
>) => {
	if (segments.length === 0) {
		// No canister to sync
		return;
	}

	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	const canisterIds = segments.map(({ canisterId }) => canisterId);

	await Promise.allSettled([
		emitSavedCanisters({
			canisterIds,
			customStore: statusesIdbStore
		}),
		emitSavedCanisters({
			canisterIds,
			customStore: monitoringHistoryIdbStore
		})
	]);

	try {
		await syncMonitoringForSegments({ identity, segments, ...rest });
	} finally {
		syncing = false;
	}
};

// eslint-disable-next-line local-rules/prefer-object-params
const sortHistory = ({ x: aKey }: ChartsData, { x: bKey }: ChartsData): number =>
	parseInt(aKey) - parseInt(bKey);

const loadDeprecatedStatuses = async ({
	identity,
	segment: { segment, canisterId },
	missionControlId
}: {
	identity: Identity;
	segment: CanisterSegment;
} & Required<Pick<PostMessageDataRequest, 'missionControlId'>>): Promise<ChartsData[]> => {
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

	return (fromNullable(results) ?? [])
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
		.sort(sortHistory);
};

const loadMonitoringHistory = async ({
	missionControlId,
	identity,
	segment: { canisterId }
}: {
	identity: Identity;
	segment: CanisterSegment;
} & Required<Pick<PostMessageDataRequest, 'missionControlId'>>): Promise<{
	history: MonitoringHistory;
	chartsData: ChartsData[];
}> => {
	const data = await get<CanisterSyncMonitoring>(canisterId, statusesIdbStore);

	// We want to get only the entries we have not collected yet
	const from = data?.data?.chartsData.sort(({ x: xA }, { x: xB }) => Number(xB) - Number(xA))[0].x;

	const history = await getMonitoringHistory({
		missionControlId: Principal.fromText(missionControlId),
		identity,
		params: {
			segmentId: Principal.from(canisterId),
			...(nonNullish(from) && { from: new Date(Number(from)) })
		}
	});

	const chartsData = history
		.filter(([_, result]) => nonNullish(fromNullable(result.cycles)))
		.map(([{ created_at }, result]) => {
			const cycles = fromNullable(result.cycles);

			// Cannot happen given above filter
			if (isNullish(cycles)) {
				return {
					x: `${fromBigIntNanoSeconds(created_at).getTime()}`,
					y: 0
				};
			}

			return {
				x: `${fromBigIntNanoSeconds(created_at).getTime()}`,
				y: parseFloat(formatTCycles(cycles.cycles.amount))
			};
		})
		.sort(sortHistory);

	return { history, chartsData };
};

const syncMonitoringForSegments = async ({
	identity,
	segments,
	missionControlId,
	withMonitoringHistory
}: {
	identity: Identity;
} & Required<
	Pick<PostMessageDataRequest, 'missionControlId' | 'segments' | 'withMonitoringHistory'>
>) => {
	await Promise.allSettled(
		segments.map(async ({ canisterId, ...rest }) => {
			try {
				const loadParams = {
					identity,
					missionControlId,
					segment: { canisterId, ...rest }
				};

				const [chartsStatuses, { history, chartsData: chartsHistory }] = await Promise.all([
					loadDeprecatedStatuses(loadParams),
					withMonitoringHistory
						? loadMonitoringHistory(loadParams)
						: Promise.resolve({ history: [], chartsData: [] })
				]);

				const totalStatusesPerDay = [...chartsStatuses, ...chartsHistory].reduce<
					Record<string, number[]>
				>((acc, { x, y }) => {
					const date = new Date(parseInt(x));
					const key = startOfDay(date).getTime();

					return {
						...acc,
						[key]: [...(acc[key] ?? []), y]
					};
				}, {});

				let chartsData = Object.entries(totalStatusesPerDay).map(([key, values]) => ({
					x: key,
					y: values.reduce((acc, value) => acc + value, 0) / values.length
				}));

				chartsData = [
					{
						x: '1731625200000',
						y: 2.948
					},
					{
						x: '1731711600000',
						y: 2.9461666666666653
					},
					{
						x: '1731798000000',
						y: 2.9389583333333325
					},
					{
						x: '1731884400000',
						y: 2.9023749999999997
					},
					{
						x: '1731970800000',
						y: 2.9
					},
					{
						x: '1732057200000',
						y: 2.8977500000000003
					},
					{
						x: '1732143600000',
						y: 2.895250000000001
					},
					{
						x: '1732230000000',
						y: 2.8928750000000005
					},
					{
						x: '1732316400000',
						y: 2.890375
					},
					{
						x: '1732402800000',
						y: 2.8880416666666657
					},
					{
						x: '1732489200000',
						y: 2.88575
					},
					{
						x: '1732575600000',
						y: 2.883125
					},
					{
						x: '1732662000000',
						y: 2.8804166666666684
					},
					{
						x: '1732748400000',
						y: 2.878083333333334
					},
					{
						x: '1732834800000',
						y: 2.874833333333333
					},
					{
						x: '1732921200000',
						y: 2.8690416666666674
					},
					{
						x: '1733007600000',
						y: 2.864291666666666
					},
					{
						x: '1733094000000',
						y: 2.8586666666666676
					},
					{
						x: '1733180400000',
						y: 2.852499999999999
					},
					{
						x: '1733266800000',
						y: 2.847750000000001
					},
					{
						x: '1733353200000',
						y: 2.843083333333333
					},
					{
						x: '1733439600000',
						y: 2.838291666666667
					},
					{
						x: '1733526000000',
						y: 2.8336666666666663
					},
					{
						x: '1733612400000',
						y: 2.8289166666666667
					},
					{
						x: '1733698800000',
						y: 2.824208333333333
					},
					{
						x: '1733785200000',
						y: 2.8195
					},
					{
						x: '1733871600000',
						y: 2.814791666666667
					},
					{
						x: '1733958000000',
						y: 2.8037083333333332
					},
					{
						x: '1734044400000',
						y: 2.796291666666667
					},
					{
						x: '1734130800000',
						y: 2.791541666666666
					},
					{
						x: '1734217200000',
						y: 2.7879285714285715
					}
				];

				await syncStatuses({
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

const syncStatuses = async ({
	canisterId,
	chartsData
}: {
	canisterId: string;
	chartsData: ChartsData[];
}) => {
	const canister: CanisterSyncMonitoring = {
		id: canisterId,
		sync: 'synced',
		data: {
			chartsData
		}
	};

	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(canisterId, canister, statusesIdbStore);

	emitCanister(canister);
};

const syncMonitoringHistory = async ({
	canisterId,
	history
}: {
	canisterId: string;
	history: MonitoringHistory;
}) => {
	const canister: CanisterSyncMonitoring = {
		id: canisterId,
		sync: 'synced',
		data: {
			history
		}
	};

	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(canisterId, canister, statusesIdbStore);

	emitCanister(canister);
};

import { getMonitoringHistory } from '$lib/api/mission-control.api';
import {
	listMissionControlStatuses,
	listOrbiterStatuses,
	listSatelliteStatuses
} from '$lib/api/mission-control.deprecated.api';
import { SYNC_MONITORING_TIMER_INTERVAL } from '$lib/constants/constants';
import { monitoringIdbStore } from '$lib/stores/idb.store';
import type { CanisterSegment, CanisterSyncMonitoring } from '$lib/types/canister';
import type { ChartsData, TimeOfDayChartData } from '$lib/types/chart';
import type {
	MonitoringHistory,
	MonitoringHistoryEntry,
	MonitoringMetadata
} from '$lib/types/monitoring';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { formatTCycles } from '$lib/utils/cycles.utils';
import { fromBigIntNanoSeconds, toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { emitCanister, emitSavedCanisters, loadIdentity } from '$lib/utils/worker.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import { get, set } from 'idb-keyval';

export const onMonitoringMessage = async ({
	data: dataMsg
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
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

	syncing = true;

	await emitSavedCanisters({
		canisterIds: segments.map(({ canisterId }) => canisterId),
		customStore: monitoringIdbStore
	});

	try {
		await syncMonitoringForSegments({ identity, segments, ...rest });
	} finally {
		syncing = false;
	}
};

// eslint-disable-next-line local-rules/prefer-object-params
const sortChartsData = ({ x: aKey }: ChartsData, { x: bKey }: ChartsData): number =>
	parseInt(aKey) - parseInt(bKey);

/**
 * @deprecated
 */
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
		.sort(sortChartsData);
};

const buildCycles = (history: MonitoringHistory): ChartsData[] =>
	history
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
		.sort(sortChartsData);

const buildWeekDepositedCycles = (history: MonitoringHistory): TimeOfDayChartData[] => {
	const startTimestamp = toBigIntNanoSeconds(addDays(startOfDay(new Date()), -6));
	const endTimestamp = toBigIntNanoSeconds(endOfDay(new Date()));

	return history
		.filter(([_, result]) => {
			const depositedCycles = fromNullable(fromNullable(result.cycles)?.deposited_cycles ?? []);

			return (
				nonNullish(depositedCycles) &&
				depositedCycles.timestamp >= startTimestamp &&
				depositedCycles.timestamp < endTimestamp
			);
		})
		.map(([{ created_at }, _]) => {
			const createdAt = fromBigIntNanoSeconds(created_at);
			const startOf = toBigIntNanoSeconds(startOfDay(createdAt));

			return {
				x: Number((created_at - startOf) / (1_000_000n * 1000n)),
				y: format(createdAt, 'yyyy-MM-dd')
			};
		});
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
	depositedCyclesChartData: TimeOfDayChartData[];
}> => {
	const data = await get<CanisterSyncMonitoring>(canisterId, monitoringIdbStore);

	// eslint-disable-next-line local-rules/prefer-object-params
	const sortHistory = (
		[{ created_at: createdAtA }]: MonitoringHistoryEntry,
		[{ created_at: createdAtB }]: MonitoringHistoryEntry
	): number => Number(createdAtB) - Number(createdAtA);

	// We want to get only the entries we have not collected yet
	const from = data?.data?.history.sort(sortHistory)?.[0]?.[0]?.created_at;

	const recentHistory = await getMonitoringHistory({
		missionControlId: Principal.fromText(missionControlId),
		identity,
		params: {
			segmentId: Principal.from(canisterId),
			...(nonNullish(from) && { from })
		}
	});

	const history = [...(data?.data?.history ?? []), ...recentHistory];

	const cyclesHistory = history
		.filter(([_, result]) => nonNullish(fromNullable(result.cycles)))
		.sort(sortHistory);

	return {
		history: cyclesHistory,
		chartsData: buildCycles(cyclesHistory),
		depositedCyclesChartData: buildWeekDepositedCycles(cyclesHistory)
	};
};

const buildChartTotalPerDay = ({
	chartsStatuses,
	chartsHistory
}: {
	chartsStatuses: ChartsData[];
	chartsHistory: ChartsData[];
}): ChartsData[] => {
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

	return Object.entries(totalStatusesPerDay).map(([key, values]) => ({
		x: key,
		y: values.reduce((acc, value) => acc + value, 0) / values.length
	}));
};

const buildMonitoringMetadata = (history: MonitoringHistory): MonitoringMetadata | undefined => {
	const cycles = fromNullable(history[0]?.[1].cycles ?? []);

	const latestCycles = cycles?.cycles;

	if (isNullish(latestCycles)) {
		return undefined;
	}

	const latestDepositedCyclesEntry = history.find(([_, entry]) =>
		nonNullish(fromNullable(fromNullable(entry.cycles ?? [])?.deposited_cycles ?? []))
	);

	const latestDepositedCycles = fromNullable(
		fromNullable(latestDepositedCyclesEntry?.[1].cycles ?? [])?.deposited_cycles ?? []
	);

	return {
		lastExecutionTime: latestCycles.timestamp,
		...(nonNullish(latestDepositedCycles) && {
			latestDepositedCycles
		})
	};
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

				const [resultStatuses, resultHistory] = await Promise.allSettled([
					loadDeprecatedStatuses(loadParams),
					withMonitoringHistory
						? loadMonitoringHistory(loadParams)
						: Promise.resolve({ history: [], chartsData: [], depositedCyclesChartData: [] })
				]);

				if (resultHistory.status === 'rejected') {
					throw new Error(resultHistory.reason);
				}

				const {
					history,
					chartsData: chartsHistory,
					depositedCyclesChartData
				} = resultHistory.value;
				const chartsStatuses = resultStatuses.status === 'fulfilled' ? resultStatuses.value : [];

				const chartsData = buildChartTotalPerDay({
					chartsStatuses,
					chartsHistory
				});

				const metadata = buildMonitoringMetadata(history);

				await syncMonitoringHistory({
					canisterId,
					history,
					chartsData,
					depositedCyclesChartData,
					metadata
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

const syncMonitoringHistory = async ({
	canisterId,
	history,
	chartsData,
	depositedCyclesChartData,
	metadata
}: {
	canisterId: string;
	history: MonitoringHistory;
	chartsData: ChartsData[];
	depositedCyclesChartData: TimeOfDayChartData[];
	metadata: MonitoringMetadata | undefined;
}) => {
	const canister: CanisterSyncMonitoring = {
		id: canisterId,
		sync: 'synced',
		data: {
			history,
			chartsData,
			charts: {
				depositedCycles: depositedCyclesChartData
			},
			...(nonNullish(metadata) && { metadata })
		}
	};

	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(canisterId, canister, monitoringIdbStore);

	emitCanister(canister);
};

import type { MissionControlDid } from '$lib/types/declarations';
import type { Principal } from '@dfinity/principal';

export type MonitoringHistoryEntry = [
	MissionControlDid.MonitoringHistoryKey,
	MissionControlDid.MonitoringHistory
];

export type MonitoringHistory = MonitoringHistoryEntry[];

export interface GetMonitoringParams {
	segmentId: Principal;
	from?: bigint;
	to?: bigint;
}

export interface MonitoringMetadata {
	lastExecutionTime: bigint;
	latestDepositedCycles?: MissionControlDid.CyclesBalance;
}

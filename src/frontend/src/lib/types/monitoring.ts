import type {
	MonitoringHistory as MonitoringHistoryDid,
	MonitoringHistoryKey
} from '$declarations/mission_control/mission_control.did';
import type { Principal } from '@dfinity/principal';

export type MonitoringHistoryEntry = [MonitoringHistoryKey, MonitoringHistoryDid];

export type MonitoringHistory = MonitoringHistoryEntry[];

export interface GetMonitoringParams {
	segmentId: Principal;
	from?: bigint;
	to?: bigint;
}

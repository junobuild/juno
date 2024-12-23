import type {
	MonitoringHistory as MonitoringHistoryDid,
	MonitoringHistoryKey
} from '$declarations/mission_control/mission_control.did';
import type { Principal } from '@dfinity/principal';

export type MonitoringHistory = [MonitoringHistoryKey, MonitoringHistoryDid][];

export interface GetMonitoringParams {
	segmentId: Principal;
	from?: Date;
	to?: Date;
}

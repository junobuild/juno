import type { Principal } from '@dfinity/principal';

export interface GetMonitoringParams {
	segmentId: Principal;
	from?: Date;
	to?: Date;
}

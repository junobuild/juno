import type { Principal } from '@dfinity/principal';

export type GetMonitoringParams = {
	segmentId: Principal;
	from?: Date;
	to?: Date;
};

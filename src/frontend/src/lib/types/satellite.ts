import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
import type { CanisterSyncData } from '$lib/types/canister';

export type SatelliteIdText = string;

export interface SegmentWithSyncData<T extends Satellite | Orbiter> {
	segment: T;
	canister: CanisterSyncData;
}

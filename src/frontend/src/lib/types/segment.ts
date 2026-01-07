import type { MissionControlDid } from '$declarations';
import type { CanisterSyncData } from '$lib/types/canister';
import type { Satellite } from '$lib/types/satellite';

export interface SegmentWithSyncData<T extends Satellite | MissionControlDid.Orbiter> {
	segment: T;
	canister: CanisterSyncData;
}

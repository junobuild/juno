import type { MissionControlDid } from '$declarations';
import type { CanisterSyncData } from '$lib/types/canister';
import type { Satellite } from '$lib/types/satellite';
import type { Ufo } from '$lib/types/ufo';

export interface SegmentWithSyncData<T extends Satellite | MissionControlDid.Orbiter> {
	segment: T;
	canister: CanisterSyncData;
}

export type SegmentWithMetadata = Satellite | Ufo;

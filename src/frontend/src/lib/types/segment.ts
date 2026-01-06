import type { ConsoleDid, MissionControlDid } from '$declarations';
import type { CanisterId, CanisterSyncData } from '$lib/types/canister';
import type { Satellite, SatelliteUiMetadata } from '$lib/types/satellite';

export interface SegmentWithSyncData<T extends Satellite | MissionControlDid.Orbiter> {
	segment: T;
	canister: CanisterSyncData;
}

// TODO: to adapt
// 1. Naming is meh
// 2. Settings when Mission Control supports canister
export type SegmentCanister = Omit<ConsoleDid.Segment, 'segment_id'> & {
	canisterId: CanisterId;
} & Pick<MissionControlDid.Satellite, 'settings'>;

// TODO: rename and move SatelliteUiMetadata
export type SegmentCanisterUi = Omit<SegmentCanister, 'metadata'> & {
	metadata: SatelliteUiMetadata;
};
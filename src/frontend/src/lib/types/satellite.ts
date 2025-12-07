import type { ConsoleDid, MissionControlDid } from '$declarations';
import type {
	SatelliteUiMetadataSchema,
	SatelliteUiTagsSchema
} from '$lib/schemas/satellite.schema';
import type { CanisterSyncData } from '$lib/types/canister';
import type { Principal } from '@icp-sdk/core/principal';
import type * as z from 'zod';

export type Satellite = MissionControlDid.Satellite | ConsoleDid.Satellite;

export type SatelliteIdText = string;
export type SatelliteId = Principal;

export interface SegmentWithSyncData<T extends Satellite | MissionControlDid.Orbiter> {
	segment: T;
	canister: CanisterSyncData;
}

export type SatelliteUiTags = z.infer<typeof SatelliteUiTagsSchema>;
export type SatelliteUiMetadata = z.infer<typeof SatelliteUiMetadataSchema>;

export type SatelliteUi = Omit<Satellite, 'metadata'> & {
	metadata: SatelliteUiMetadata;
};

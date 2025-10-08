import type {
	SatelliteUiMetadataSchema,
	SatelliteUiTagsSchema
} from '$lib/schemas/satellite.schema';
import type { CanisterSyncData } from '$lib/types/canister';
import type { MissionControlDid } from '$lib/types/declarations';
import type * as z from 'zod';

export type SatelliteIdText = string;

export interface SegmentWithSyncData<
	T extends MissionControlDid.Satellite | MissionControlDid.Orbiter
> {
	segment: T;
	canister: CanisterSyncData;
}

export type SatelliteUiTags = z.infer<typeof SatelliteUiTagsSchema>;
export type SatelliteUiMetadata = z.infer<typeof SatelliteUiMetadataSchema>;

export type SatelliteUi = Omit<MissionControlDid.Satellite, 'metadata'> & {
	metadata: SatelliteUiMetadata;
};

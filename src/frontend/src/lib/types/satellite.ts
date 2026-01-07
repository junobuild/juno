import type { MissionControlDid } from '$declarations';
import type {
	SatelliteUiMetadataSchema,
	SatelliteUiTagsSchema
} from '$lib/schemas/satellite.schema';
import type { Principal } from '@icp-sdk/core/principal';
import type * as z from 'zod';

export type Satellite = MissionControlDid.Satellite;

export type SatelliteIdText = string;
export type SatelliteId = Principal;

export type SatelliteUiTags = z.infer<typeof SatelliteUiTagsSchema>;
export type SatelliteUiMetadata = z.infer<typeof SatelliteUiMetadataSchema>;

export type SatelliteUi = Omit<Satellite, 'metadata'> & {
	metadata: SatelliteUiMetadata;
};

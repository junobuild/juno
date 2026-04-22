import type { MissionControlDid } from '$declarations';
import type {
	SatelliteUiMetadataSchema,
	SatelliteUiTagsSchema
} from '$lib/schemas/satellite.schema';
import type { SatelliteUiMetadata } from '$lib/types/satellite';
import type { Principal } from '@icp-sdk/core/principal';
import type { PrincipalText } from '@junobuild/schema';
import type * as z from 'zod';

export type Ufo = MissionControlDid.Ufo;

export type UfoIdText = PrincipalText;
export type UfoId = Principal;

export type UfoUiTags = z.infer<typeof SatelliteUiTagsSchema>;
export type UfoUiMetadata = z.infer<typeof SatelliteUiMetadataSchema>;

export type UfoUi = Omit<Ufo, 'metadata'> & {
	metadata: SatelliteUiMetadata;
};

import type {
	CachedSatelliteVersionMetadataSchema,
	CachedVersionMetadataSchema,
	SatelliteVersionMetadataSchema,
	VersionMetadataSchema
} from '$lib/schemas/version.schema';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Nullish } from '@dfinity/zod-schemas';
import type * as z from 'zod';

export type VersionMetadata = z.infer<typeof VersionMetadataSchema>;
export type SatelliteVersionMetadata = z.infer<typeof SatelliteVersionMetadataSchema>;

export type CachedVersionMetadata = z.infer<typeof CachedVersionMetadataSchema>;
export type CachedSatelliteVersionMetadata = z.infer<typeof CachedSatelliteVersionMetadataSchema>;

export type VersionMetadataUi = VersionMetadata & { warning: boolean };
export type SatelliteVersionMetadataUi = SatelliteVersionMetadata & { warning: boolean };

export interface VersionRegistry {
	satellites: Record<SatelliteIdText, Nullish<SatelliteVersionMetadata>>;
	missionControl: Nullish<VersionMetadata>;
	orbiter: Nullish<VersionMetadata>;
}

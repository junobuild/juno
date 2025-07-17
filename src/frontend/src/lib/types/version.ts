import type {
	CachedSatelliteVersionMetadataSchema,
	CachedVersionMetadataSchema,
	SatelliteVersionMetadataSchema,
	VersionMetadataSchema
} from '$lib/schemas/version.schema';
import type { OptionIdentity } from '$lib/types/itentity';
import type * as z from 'zod/v4';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';

export type VersionMetadata = z.infer<typeof VersionMetadataSchema>;
export type SatelliteVersionMetadata = z.infer<typeof SatelliteVersionMetadataSchema>;

export type CachedVersionMetadata = z.infer<typeof CachedVersionMetadataSchema>;
export type CachedSatelliteVersionMetadata = z.infer<typeof CachedSatelliteVersionMetadataSchema>;

export interface LoadVersionBaseParams {
	skipReload: boolean;
	identity: OptionIdentity;
	toastError?: boolean;
}

export type LoadVersionResult =
	| { result: 'loaded' }
	| { result: 'skipped' }
	| { result: 'error'; err: unknown };

export type VersionMetadataUi = VersionMetadata & { warning: boolean };
export type SatelliteVersionMetadataUi = SatelliteVersionMetadata & { warning: boolean };

export interface VersionRegistry {
	satellites: Record<SatelliteIdText, SatelliteVersionMetadata | undefined | null>;
	missionControl: Option<VersionMetadata>;
	orbiter: Option<VersionMetadata>;
}
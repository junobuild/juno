import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
import {
	type SatelliteUiMetadataSchema,
	SatelliteUiTagsSchema
} from '$lib/schemas/satellite.schema';
import type { CanisterSyncData } from '$lib/types/canister';
import type * as z from 'zod/v4';

export type SatelliteIdText = string;

export interface SegmentWithSyncData<T extends Satellite | Orbiter> {
	segment: T;
	canister: CanisterSyncData;
}

export type SatelliteUiTags = z.infer<typeof SatelliteUiTagsSchema>;
export type SatelliteUiMetadata = z.infer<typeof SatelliteUiMetadataSchema>;

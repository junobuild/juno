import type { MissionControlDid } from '$declarations';
import type { MetadataUi } from '$lib/types/metadata';
import type { Principal } from '@icp-sdk/core/principal';

export type Satellite = MissionControlDid.Satellite;

export type SatelliteIdText = string;
export type SatelliteId = Principal;

export type SatelliteUi = Omit<Satellite, 'metadata'> & {
	metadata: MetadataUi;
};

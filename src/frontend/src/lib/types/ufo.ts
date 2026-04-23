import type { MissionControlDid } from '$declarations';
import type { MetadataUi } from '$lib/types/metadata';
import type { Principal } from '@icp-sdk/core/principal';
import type { PrincipalText } from '@junobuild/schema';

export type Ufo = MissionControlDid.Ufo;

export type UfoIdText = PrincipalText;
export type UfoId = Principal;

export type UfoUi = Omit<Ufo, 'metadata'> & {
	metadata: MetadataUi;
};

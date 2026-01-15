import type { CertifiedData } from '$lib/types/store';
import type { Principal } from '@icp-sdk/core/principal';

export type MissionControlId = Principal;

export type MissionControlCertifiedId = CertifiedData<MissionControlId | null> | undefined;

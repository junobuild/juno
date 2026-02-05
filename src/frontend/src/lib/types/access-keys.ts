import type { MissionControlId } from '$lib/types/mission-control';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export type AddAccessKeyScope = 'write' | 'admin' | 'submit';

export type AddAccessKeyKind = 'automation' | 'emulator';

export type AddAccessKeyMetadataParams = { profile: string } | { kind: AddAccessKeyKind };

export interface AddAccessKeyParams {
	accessKeyId: string | Principal;
	metadata?: AddAccessKeyMetadataParams;
	scope: AddAccessKeyScope;
}

export type AccessKeyIdParam = Pick<AddAccessKeyParams, 'accessKeyId'>;

export type AddAdminAccessKeyParams = Omit<AddAccessKeyParams, 'scope'>;

export type AddAccessKeyResult = { result: 'ok' } | { result: 'error'; err?: unknown };

export type AccessKeyWithMissionControlFn = (params: {
	identity: Identity;
	missionControlId: MissionControlId;
}) => Promise<void>;

export type AccessKeyWithDevFn = (params: { identity: Identity }) => Promise<void>;

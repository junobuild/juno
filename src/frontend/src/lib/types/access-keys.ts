import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export type AddAccessKeyScope = 'write' | 'admin' | 'submit';

export interface AddAccessKeyParams {
	accessKeyId: string | Principal;
	profile: Option<string>;
	scope: AddAccessKeyScope;
}

export type AddAdminAccessKeyParams = Omit<AddAccessKeyParams, 'scope'>;

export type AddAccessKeyResult = { result: 'ok' } | { result: 'error'; err?: unknown };

export type AccessKeyWithMissionControlFn = (params: {
	identity: Identity;
	missionControlId: MissionControlId;
}) => Promise<void>;

export type AccessKeyWithDevFn = (params: { identity: Identity }) => Promise<void>;

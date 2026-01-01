import type { Option } from '$lib/types/utils';
import type { Principal } from '@icp-sdk/core/principal';

export interface SetAccessKeyParams {
	accessKeyId: string | Principal;
	profile: Option<string>;
	scope: SetAccessKeyScope;
}

export type SetAccessKeyScope = 'write' | 'admin' | 'submit';

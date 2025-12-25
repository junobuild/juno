import type { Option } from '$lib/types/utils';
import type { Principal } from '@icp-sdk/core/principal';

export interface SetControllerParams {
	controllerId: string | Principal;
	profile: Option<string>;
	scope: SetControllerScope;
}

export type SetControllerScope = 'write' | 'admin' | 'submit';

import type { Option } from '$lib/types/utils';

export interface SetControllerParams {
	controllerId: string;
	profile: Option<string>;
	scope: SetControllerScope;
}

export type SetControllerScope = 'write' | 'admin' | 'submit';

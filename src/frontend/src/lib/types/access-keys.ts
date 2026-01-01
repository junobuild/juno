import type { Option } from '$lib/types/utils';
import type { Principal } from '@icp-sdk/core/principal';

export type AddAccessKeyScope = 'write' | 'admin' | 'submit';

export interface AddAccessKeyParams {
	accessKeyId: string | Principal;
	profile: Option<string>;
	scope: AddAccessKeyScope;
}

export type AddAdminAccessKeyParams = Omit<AddAccessKeyParams, 'scope'>;

export type AddAccessKeyResult = { result: 'ok' } | { result: 'error'; err?: unknown };

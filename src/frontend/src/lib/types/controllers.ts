import type { Option } from '$lib/types/utils';
import type { Principal } from '@icp-sdk/core/principal';

// TODO: rename controller.ts to access-key.ts
// TODO: rename Set... to Add...

export type SetAccessKeyScope = 'write' | 'admin' | 'submit';

export interface SetAccessKeyParams {
	accessKeyId: string | Principal;
	profile: Option<string>;
	scope: SetAccessKeyScope;
}

export type SetAdminAccessKeyParams = Omit<SetAccessKeyParams, 'scope'>;

export type AddAccessKeyResult = { result: 'ok' } | { result: 'error'; err?: unknown };

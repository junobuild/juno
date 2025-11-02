import type { OptionIdentity } from '$lib/types/itentity';
import type { AuthClient } from '@dfinity/auth-client';

export interface SignedInIdentity {
	identity: OptionIdentity;
}
export type SignInFn = (params: { authClient: AuthClient }) => Promise<SignedInIdentity>;

import type { AuthClient } from '@dfinity/auth-client';
import type { OptionIdentity } from '$lib/types/itentity';

export type SignedInIdentity = { identity: OptionIdentity };
export type SignInFn = (params: {authClient: AuthClient}) => Promise<SignedInIdentity>;
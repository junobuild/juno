import type { NullishIdentity } from '$lib/types/itentity';
import type { AuthClient } from '@icp-sdk/auth/client';

export interface SignedInIdentity {
	identity: NullishIdentity;
}

export type SignInWithAuthClient = (params: {
	authClient: AuthClient;
}) => Promise<SignedInIdentity>;
export type SignInWithNewAuthClient = () => Promise<void>;

export type OpenIdAuthProvider = 'google' | 'github';

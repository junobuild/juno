import type { OptionIdentity } from '$lib/types/itentity';
import type { AuthClient } from '@icp-sdk/auth/client';

export interface SignedInIdentity {
	identity: OptionIdentity;
}

export type SignInWithAuthClient = (params: {
	authClient: AuthClient;
}) => Promise<SignedInIdentity>;
export type SignInWithNewAuthClient = () => Promise<void>;

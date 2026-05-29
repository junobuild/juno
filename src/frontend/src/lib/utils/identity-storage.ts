import { IdbStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from '@icp-sdk/auth/client';
import type { DelegationChain, ECDSAKeyIdentity } from '@icp-sdk/core/identity';

/**
 * Persist a session key and delegation chain to the same IndexedDB keys
 * that the Internet Identity AuthClient uses, without instantiating an
 * AuthClient. Used by the OpenID and dev sign-in flows, which obtain
 * the identity material out-of-band and only need to hand it off to
 * storage for the auth store to pick up on its next sync.
 */
export const saveIdentityToStorage = async ({
	delegationChain,
	sessionKey
}: {
	delegationChain: DelegationChain;
	sessionKey: ECDSAKeyIdentity;
}): Promise<void> => {
	const storage = new IdbStorage();

	await Promise.all([
		storage.set(KEY_STORAGE_KEY, sessionKey.getKeyPair()),
		storage.set(KEY_STORAGE_DELEGATION, JSON.stringify(delegationChain.toJSON()))
	]);
};

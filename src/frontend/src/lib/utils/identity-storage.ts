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

/**
 * Remove the session key and delegation chain that the auth store reads
 * when reconstructing the current identity. Called on sign-out and as a
 * preamble before starting a fresh Internet Identity login, to avoid
 * pairing a stale stored key with a freshly issued delegation (which
 * would otherwise produce ECDSA P256 signature / delegation mismatches).
 */
export const clearIdentityStorage = async (): Promise<void> => {
	const storage = new IdbStorage();

	await Promise.all([storage.remove(KEY_STORAGE_KEY), storage.remove(KEY_STORAGE_DELEGATION)]);
};

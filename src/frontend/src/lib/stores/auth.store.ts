import { AuthBroadcastChannel } from '$lib/providers/auth-broadcast.provider';
import type { SignInWithNewAuthClient } from '$lib/types/auth';
import type { NullishIdentity } from '$lib/types/itentity';
import { clearIdentityStorage } from '$lib/utils/identity-storage';
import { loadIdentity } from '$lib/utils/worker.utils';
import { type Readable, writable } from 'svelte/store';

export interface AuthStoreData {
	identity: NullishIdentity;
}

export interface AuthStore extends Readable<AuthStoreData> {
	sync: () => Promise<void>;
	forceSync: () => Promise<void>;
	signInWithII: (params: { signInFn: SignInWithNewAuthClient }) => Promise<void>;
	signInWithOpenId: (params: { signInFn: SignInWithNewAuthClient }) => Promise<void>;
	signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
	const { subscribe, set } = writable<AuthStoreData>({
		identity: undefined
	});

	// Identity always comes from IndexedDB: the session key + delegation chain
	// written either by AuthClient.login (II flow) or by saveIdentityToStorage
	// (OpenID / dev flows). There is no in-memory cache to keep coherent across
	// tabs — IDB is the single source of truth.
	const sync = async () => {
		const identity = await loadIdentity();
		set({ identity });
	};

	const broadCastSignIn = () => {
		try {
			// If the user has more than one tab open in the same browser, the
			// other tabs need to learn that a login has occurred so they can
			// re-sync. We use a BroadcastChannel for that.
			const bc = AuthBroadcastChannel.getInstance();
			bc.postLoginSuccess();
		} catch (err: unknown) {
			// Non-critical: broadcast failure only degrades multi-tab UX.
			console.warn('Auth BroadcastChannel posting failed', err);
		}
	};

	const signInThenSync = async ({ signInFn }: { signInFn: SignInWithNewAuthClient }) => {
		await signInFn();
		await sync();
		broadCastSignIn();
	};

	return {
		subscribe,
		sync,
		forceSync: sync,
		signInWithII: signInThenSync,
		signInWithOpenId: signInThenSync,
		signOut: async () => {
			await clearIdentityStorage();
			set({ identity: null });
		}
	};
};

export const authStore = initAuthStore();

export const authRemainingTimeStore = writable<number | undefined>(undefined);

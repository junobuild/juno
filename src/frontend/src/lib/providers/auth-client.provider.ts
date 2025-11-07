import { isNullish } from '@dfinity/utils';
import {
	AuthClient,
	IdbStorage,
	KEY_STORAGE_DELEGATION,
	KEY_STORAGE_KEY
} from '@icp-sdk/auth/client';
import type { DelegationChain, ECDSAKeyIdentity } from '@icp-sdk/core/identity';

export class AuthClientProvider {
	static #instance: AuthClientProvider;

	// We use a dedicated storage for the auth client to better manage it, e.g. clear it for a new login.
	// It is similar as the default fallback option of AgentJS.
	readonly #storage: IdbStorage;

	private constructor() {
		this.#storage = new IdbStorage();
	}

	static getInstance(): AuthClientProvider {
		if (isNullish(this.#instance)) {
			this.#instance = new AuthClientProvider();
		}

		return this.#instance;
	}

	createAuthClient = async (): Promise<AuthClient> => {
		// TODO: Workaround for agent-js. Disable utter annoying console.warn used as pseudo documentation.
		const hideAgentJsConsoleWarn = globalThis.console.warn;
		globalThis.console.warn = (): null => null;

		try {
			return await AuthClient.create({
				storage: this.#storage,
				idleOptions: {
					disableIdle: true,
					disableDefaultIdleCallback: true
				}
			});
		} finally {
			// Redo console.warn
			globalThis.console.warn = hideAgentJsConsoleWarn;
		}
	};

	/**
	 * Since icp-js-core persists identity keys in IndexedDB by default,
	 * they could be tampered with and affect the next login.
	 * To ensure each session starts clean and safe, we clear the stored keys before creating a new AuthClient.
	 */
	safeCreateAuthClient = async (): Promise<AuthClient> => {
		await this.#storage.remove(KEY_STORAGE_KEY);
		return await this.createAuthClient();
	};

	setAuthClientStorage = async ({
		delegationChain,
		sessionKey
	}: {
		delegationChain: DelegationChain;
		sessionKey: ECDSAKeyIdentity;
	}) => {
		await Promise.all([
			this.#storage.set(KEY_STORAGE_KEY, sessionKey.getKeyPair()),
			this.#storage.set(KEY_STORAGE_DELEGATION, JSON.stringify(delegationChain.toJSON()))
		]);
	};

	get __test_only_auth_client_storage__(): IdbStorage {
		return this.#storage;
	}
}

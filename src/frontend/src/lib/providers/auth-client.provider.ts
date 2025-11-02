import { AuthClient, IdbStorage, KEY_STORAGE_KEY } from '@dfinity/auth-client';

export const createAuthClient = (): Promise<AuthClient> =>
	AuthClient.create({
		idleOptions: {
			disableIdle: true,
			disableDefaultIdleCallback: true
		}
	});

export const resetAuthClient = async (): Promise<AuthClient> => {
	// Since AgentJS persists the identity key in IndexedDB by default,
	// it can be tampered with and affect the next login with Internet Identity.
	// To ensure each session starts clean and safe, we clear the stored keys before creating a new AuthClient
	// in case the user is not authenticated.
	const storage = new IdbStorage();
	await storage.remove(KEY_STORAGE_KEY);

	return await createAuthClient();
};

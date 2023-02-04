import { AuthClient } from '@dfinity/auth-client';

export const createAuthClient = (): Promise<AuthClient> =>
	AuthClient.create({
		idleOptions: {
			disableIdle: true,
			disableDefaultIdleCallback: true
		}
	});

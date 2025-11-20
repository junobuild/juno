import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import { AuthClient, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from '@icp-sdk/auth/client';

describe('auth-client.provider', () => {
	const {
		__test_only_auth_client_storage__: authClientStorage,
		createAuthClient,
		safeCreateAuthClient
	} = AuthClientProvider.getInstance();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(AuthClient, 'create');

		vi.spyOn(authClientStorage, 'get');
		vi.spyOn(authClientStorage, 'set');
		vi.spyOn(authClientStorage, 'remove');
	});

	describe('createAuthClient', () => {
		it('should create an auth client', async () => {
			const result = await createAuthClient();

			expect(result).toBeInstanceOf(AuthClient);

			expect(AuthClient.create).toHaveBeenCalledExactlyOnceWith({
				storage: authClientStorage,
				idleOptions: {
					disableIdle: true,
					disableDefaultIdleCallback: true
				}
			});

			expect(authClientStorage.get).toHaveBeenCalledExactlyOnceWith(KEY_STORAGE_KEY);

			expect(authClientStorage.set).toHaveBeenCalledExactlyOnceWith(
				KEY_STORAGE_KEY,
				expect.any(Object)
			);

			expect(authClientStorage.remove).not.toHaveBeenCalled();
		});

		it('should not create a new key when called a second time', async () => {
			const result = await createAuthClient();

			expect(result).toBeInstanceOf(AuthClient);

			expect(AuthClient.create).toHaveBeenCalledExactlyOnceWith({
				storage: authClientStorage,
				idleOptions: {
					disableIdle: true,
					disableDefaultIdleCallback: true
				}
			});

			expect(authClientStorage.get).toHaveBeenCalledTimes(2);
			expect(authClientStorage.get).toHaveBeenNthCalledWith(1, KEY_STORAGE_KEY);
			expect(authClientStorage.get).toHaveBeenNthCalledWith(2, KEY_STORAGE_DELEGATION);

			expect(authClientStorage.set).not.toHaveBeenCalled();

			expect(authClientStorage.remove).not.toHaveBeenCalled();
		});
	});

	describe('safeCreateAuthClient', () => {
		it('should create an auth client', async () => {
			const result = await safeCreateAuthClient();

			expect(result).toBeInstanceOf(AuthClient);

			expect(AuthClient.create).toHaveBeenCalledExactlyOnceWith({
				storage: authClientStorage,
				idleOptions: {
					disableIdle: true,
					disableDefaultIdleCallback: true
				}
			});

			expect(authClientStorage.get).toHaveBeenCalledExactlyOnceWith(KEY_STORAGE_KEY);

			expect(authClientStorage.set).toHaveBeenCalledExactlyOnceWith(
				KEY_STORAGE_KEY,
				expect.any(Object)
			);

			expect(authClientStorage.remove).toHaveBeenCalledExactlyOnceWith(KEY_STORAGE_KEY);
		});

		it('should create a new key when called a second time', async () => {
			const result = await safeCreateAuthClient();

			expect(result).toBeInstanceOf(AuthClient);

			expect(AuthClient.create).toHaveBeenCalledExactlyOnceWith({
				storage: authClientStorage,
				idleOptions: {
					disableIdle: true,
					disableDefaultIdleCallback: true
				}
			});

			expect(authClientStorage.get).toHaveBeenCalledExactlyOnceWith(KEY_STORAGE_KEY);

			expect(authClientStorage.set).toHaveBeenCalledExactlyOnceWith(
				KEY_STORAGE_KEY,
				expect.any(Object)
			);

			expect(authClientStorage.remove).toHaveBeenCalledExactlyOnceWith(KEY_STORAGE_KEY);
		});
	});
});

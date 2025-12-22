import type { ConsoleDid } from '$declarations';
import * as consoleApi from '$lib/api/console.api';
import { initAccount } from '$lib/services/console/account.services';
import * as authServices from '$lib/services/console/auth/auth.services';
import { accountCertifiedStore } from '$lib/stores/account.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { nowInBigIntNanoSeconds } from '@dfinity/utils';
import { get } from 'svelte/store';
import { mockIdentity, mockPrincipal } from '../../mocks/identity.mock';

vi.mock('$lib/api/console.api');
vi.mock('$lib/services/console/auth/auth.services');

describe('initAccount', () => {
	const mockAccount: ConsoleDid.Account = {
		owner: mockPrincipal,
		mission_control_id: [],
		created_at: nowInBigIntNanoSeconds(),
		updated_at: nowInBigIntNanoSeconds(),
		credits: { e8s: 0n },
		provider: []
	};

	beforeEach(() => {
		vi.clearAllMocks();
		accountCertifiedStore.reset();

		// we mock console.error just to avoid unnecessary logs when the error is toasted
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	describe('when identity is null', () => {
		it('should skip initialization', async () => {
			const result = await initAccount({ identity: null });

			expect(result).toEqual({ result: 'skip' });
			expect(consoleApi.getAccount).not.toHaveBeenCalled();
		});
	});

	describe('when identity is undefined', () => {
		it('should skip initialization', async () => {
			const result = await initAccount({ identity: undefined });

			expect(result).toEqual({ result: 'skip' });
			expect(consoleApi.getAccount).not.toHaveBeenCalled();
		});
	});

	describe('Get uncertified account', () => {
		it('should set uncertified account and return success', async () => {
			vi.mocked(consoleApi.getAccount).mockResolvedValue(mockAccount);

			const result = await initAccount({ identity: mockIdentity });

			expect(consoleApi.getAccount).toHaveBeenCalledWith({
				identity: mockIdentity,
				certified: false
			});

			const store = get(accountCertifiedStore);

			expect(store).toEqual({
				data: mockAccount,
				certified: false
			});

			expect(result).toEqual({ result: 'success' });
		});

		it('should trigger background certified account assertion', async () => {
			vi.mocked(consoleApi.getAccount).mockImplementation(async () => {
				return mockAccount;
			});

			await initAccount({ identity: mockIdentity });

			await vi.waitFor(() => {
				expect(consoleApi.getAccount).toHaveBeenCalledWith({
					identity: mockIdentity,
					certified: true
				});
			});

			const store = get(accountCertifiedStore);

			expect(store).toEqual({
				data: mockAccount,
				certified: true
			});
		});
	});

	describe('when no account exists', () => {
		it('should create new account and return success', async () => {
			vi.mocked(consoleApi.getAccount).mockResolvedValue(undefined);
			vi.mocked(consoleApi.getOrInitAccount).mockResolvedValue(mockAccount);

			const result = await initAccount({ identity: mockIdentity });

			expect(consoleApi.getAccount).toHaveBeenCalledWith({
				identity: mockIdentity,
				certified: false
			});

			expect(consoleApi.getOrInitAccount).toHaveBeenCalledWith({
				identity: mockIdentity
			});

			const store = get(accountCertifiedStore);

			expect(store).toEqual({
				data: mockAccount,
				certified: true
			});

			expect(result).toEqual({ result: 'success' });
		});
	});

	describe('error handling', () => {
		it('should show error toast and sign out on getAccount error', async () => {
			const error = new Error('Network error');
			vi.mocked(consoleApi.getAccount).mockRejectedValue(error);

			const errorSpy = vi.spyOn(toasts, 'error');

			const result = await initAccount({ identity: mockIdentity });

			expect(errorSpy).toHaveBeenCalledWith({
				text: 'Failed to initialize account.',
				detail: error
			});

			expect(authServices.accountErrorSignOut).toHaveBeenCalled();
			expect(result).toEqual({ result: 'error' });
		});

		it('should show error toast and sign out on getOrInitAccount error', async () => {
			const error = new Error('Creation failed');
			vi.mocked(consoleApi.getAccount).mockResolvedValue(undefined);
			vi.mocked(consoleApi.getOrInitAccount).mockRejectedValue(error);

			const errorSpy = vi.spyOn(toasts, 'error');

			const result = await initAccount({ identity: mockIdentity });

			expect(errorSpy).toHaveBeenCalledWith({
				text: 'Failed to initialize account.',
				detail: error
			});

			expect(authServices.accountErrorSignOut).toHaveBeenCalled();
			expect(result).toEqual({ result: 'error' });
		});
	});

	describe('assertAccount background validation', () => {
		it('should update store with certified account on successful assertion', async () => {
			vi.mocked(consoleApi.getAccount).mockImplementation(async ({ certified }) => {
				return mockAccount;
			});

			await initAccount({ identity: mockIdentity });

			await vi.waitFor(() => {
				const store = get(accountCertifiedStore);

				expect(store).toEqual({
					data: mockAccount,
					certified: true
				});
			});
		});

		it('should sign out if certified account is null', async () => {
			vi.mocked(consoleApi.getAccount).mockImplementation(async ({ certified }) => {
				if (certified) {
					return undefined;
				}
				return mockAccount;
			});

			await initAccount({ identity: mockIdentity });

			await vi.waitFor(() => {
				expect(authServices.accountErrorSignOut).toHaveBeenCalled();
			});
		});

		it('should sign out on assertion error', async () => {
			vi.mocked(consoleApi.getAccount).mockImplementation(async ({ certified }) => {
				if (certified) {
					throw new Error('Certification failed');
				}
				return mockAccount;
			});

			await initAccount({ identity: mockIdentity });

			await vi.waitFor(() => {
				expect(authServices.accountErrorSignOut).toHaveBeenCalled();
			});
		});
	});
});

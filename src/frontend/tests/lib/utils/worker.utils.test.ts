import { loadIdentity } from '$lib/utils/worker.utils';
import { IdbStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from '@icp-sdk/auth/client';
import type * as IcpIdentity from '@icp-sdk/core/identity';
import {
	DelegationChain,
	DelegationIdentity,
	ECDSAKeyIdentity,
	isDelegationValid
} from '@icp-sdk/core/identity';

vi.mock('@icp-sdk/core/identity', async (importOriginal) => {
	const actual = await importOriginal<typeof IcpIdentity>();
	return {
		...actual,
		isDelegationValid: vi.fn(),
		ECDSAKeyIdentity: {
			...actual.ECDSAKeyIdentity,
			fromKeyPair: vi.fn()
		},
		DelegationIdentity: {
			...actual.DelegationIdentity,
			fromDelegation: vi.fn()
		},
		DelegationChain: {
			...actual.DelegationChain,
			fromJSON: vi.fn()
		}
	};
});

describe('worker.utils', () => {
	describe('loadIdentity', () => {
		const fakeKeyPair = { publicKey: 'pk', privateKey: 'sk' } as unknown as CryptoKeyPair;
		const fakeDelegationStr = '{"delegations":[],"publicKey":"pk"}';
		const fakeDelegationChain = { _isFake: true } as unknown as DelegationChain;
		const fakeSessionKey = { _isFakeKey: true } as unknown as ECDSAKeyIdentity;

		const fakePrincipal = (anonymous: boolean) => ({
			isAnonymous: () => anonymous
		});

		const fakeIdentity = (anonymous: boolean) =>
			({
				getPrincipal: () => fakePrincipal(anonymous)
			}) as unknown as DelegationIdentity;

		beforeEach(() => {
			vi.clearAllMocks();
			vi.spyOn(IdbStorage.prototype, 'get').mockImplementation((key) => {
				if (key === KEY_STORAGE_KEY) {
					return Promise.resolve(fakeKeyPair);
				}
				if (key === KEY_STORAGE_DELEGATION) {
					return Promise.resolve(fakeDelegationStr);
				}
				return Promise.resolve(null);
			});
			vi.mocked(DelegationChain.fromJSON).mockReturnValue(fakeDelegationChain);
			vi.mocked(isDelegationValid).mockReturnValue(true);
			vi.mocked(ECDSAKeyIdentity.fromKeyPair).mockResolvedValue(fakeSessionKey);
			vi.mocked(DelegationIdentity.fromDelegation).mockReturnValue(fakeIdentity(false));
		});

		it('should return null when KEY_STORAGE_KEY is missing', async () => {
			vi.spyOn(IdbStorage.prototype, 'get').mockImplementation((key) => {
				if (key === KEY_STORAGE_KEY) {
					return Promise.resolve(null);
				}
				return Promise.resolve(fakeDelegationStr);
			});

			await expect(loadIdentity()).resolves.toBeNull();
			expect(DelegationChain.fromJSON).not.toHaveBeenCalled();
		});

		it('should return null when KEY_STORAGE_DELEGATION is missing', async () => {
			vi.spyOn(IdbStorage.prototype, 'get').mockImplementation((key) => {
				if (key === KEY_STORAGE_KEY) {
					return Promise.resolve(fakeKeyPair);
				}
				return Promise.resolve(null);
			});

			await expect(loadIdentity()).resolves.toBeNull();
			expect(DelegationChain.fromJSON).not.toHaveBeenCalled();
		});

		it('should return null when delegation JSON is corrupt', async () => {
			vi.mocked(DelegationChain.fromJSON).mockImplementation(() => {
				throw new Error('parse error');
			});

			await expect(loadIdentity()).resolves.toBeNull();
			expect(isDelegationValid).not.toHaveBeenCalled();
		});

		it('should return null when delegation is invalid', async () => {
			vi.mocked(isDelegationValid).mockReturnValue(false);

			await expect(loadIdentity()).resolves.toBeNull();
			expect(ECDSAKeyIdentity.fromKeyPair).not.toHaveBeenCalled();
		});

		it('should return null when the reconstructed identity is anonymous', async () => {
			vi.mocked(DelegationIdentity.fromDelegation).mockReturnValue(fakeIdentity(true));

			await expect(loadIdentity()).resolves.toBeNull();
		});

		it('should return the reconstructed identity when storage and delegation are valid', async () => {
			const result = await loadIdentity();

			expect(result).not.toBeNull();
			expect(DelegationChain.fromJSON).toHaveBeenCalledExactlyOnceWith(fakeDelegationStr);
			expect(isDelegationValid).toHaveBeenCalledExactlyOnceWith(fakeDelegationChain);
			expect(ECDSAKeyIdentity.fromKeyPair).toHaveBeenCalledExactlyOnceWith(fakeKeyPair);
			expect(DelegationIdentity.fromDelegation).toHaveBeenCalledExactlyOnceWith(
				fakeSessionKey,
				fakeDelegationChain
			);
		});
	});
});

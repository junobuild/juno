import { saveIdentityToStorage } from '$lib/utils/identity-storage';
import { IdbStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from '@icp-sdk/auth/client';
import type { DelegationChain, ECDSAKeyIdentity } from '@icp-sdk/core/identity';

describe('identity-storage', () => {
	describe('saveIdentityToStorage', () => {
		beforeEach(() => {
			vi.clearAllMocks();
			vi.spyOn(IdbStorage.prototype, 'set').mockResolvedValue(undefined);
		});

		const buildIdentityArgs = ({
			delegationJson,
			keyPair
		}: {
			delegationJson: unknown;
			keyPair: unknown;
		}) => ({
			sessionKey: {
				getKeyPair: vi.fn(() => keyPair)
			} as unknown as ECDSAKeyIdentity,
			delegationChain: {
				toJSON: vi.fn(() => delegationJson)
			} as unknown as DelegationChain
		});

		it('should persist sessionKey under KEY_STORAGE_KEY and delegation under KEY_STORAGE_DELEGATION', async () => {
			const keyPair = { publicKey: 'pk', privateKey: 'sk' };
			const delegationJson = { delegations: [], publicKey: 'pk' };

			const args = buildIdentityArgs({ delegationJson, keyPair });

			await saveIdentityToStorage(args);

			expect(IdbStorage.prototype.set).toHaveBeenCalledTimes(2);
			expect(IdbStorage.prototype.set).toHaveBeenCalledWith(KEY_STORAGE_KEY, keyPair);
			expect(IdbStorage.prototype.set).toHaveBeenCalledWith(
				KEY_STORAGE_DELEGATION,
				JSON.stringify(delegationJson)
			);
		});

		it('should call getKeyPair and toJSON exactly once', async () => {
			const args = buildIdentityArgs({
				delegationJson: { delegations: [] },
				keyPair: { publicKey: 'x' }
			});

			await saveIdentityToStorage(args);

			expect(args.sessionKey.getKeyPair).toHaveBeenCalledOnce();
			expect(args.delegationChain.toJSON).toHaveBeenCalledOnce();
		});

		it('should JSON.stringify the delegation toJSON output verbatim', async () => {
			const delegationJson = {
				delegations: [{ delegation: { pubkey: 'p', expiration: '1' }, signature: 's' }],
				publicKey: 'root'
			};

			const args = buildIdentityArgs({
				delegationJson,
				keyPair: { publicKey: 'x' }
			});

			await saveIdentityToStorage(args);

			expect(IdbStorage.prototype.set).toHaveBeenCalledWith(
				KEY_STORAGE_DELEGATION,
				JSON.stringify(delegationJson)
			);
		});
	});
});

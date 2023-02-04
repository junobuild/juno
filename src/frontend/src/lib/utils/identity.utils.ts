import type { Identity } from '@dfinity/agent';
import { DelegationChain, DelegationIdentity, ECDSAKeyIdentity } from '@dfinity/identity';

export const initIdentity = async ({
	identityKey,
	delegationChain
}: {
	identityKey: CryptoKeyPair;
	delegationChain: string;
}): Promise<Identity> => {
	const chain: DelegationChain = DelegationChain.fromJSON(delegationChain);
	const key: ECDSAKeyIdentity = await ECDSAKeyIdentity.fromKeyPair(identityKey);

	return DelegationIdentity.fromDelegation(key, chain);
};

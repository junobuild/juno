import { AccountIdentifier } from '@dfinity/nns';
import { initIdentity } from './identity.utils.mjs';

export const accountIdentifier = () => {
	const identity = initIdentity();
	return AccountIdentifier.fromPrincipal({
		principal: identity.getPrincipal(),
		subAccount: undefined
	});
};

export const ledgerCanisterId = 'r7inp-6aaaa-aaaaa-aaabq-cai';

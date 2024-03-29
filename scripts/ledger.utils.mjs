import { AccountIdentifier } from '@junobuild/ledger';
import { initIdentity } from './identity.utils.mjs';

export const accountIdentifier = (mainnet, principal) => {
	const identity = initIdentity(mainnet);

	return AccountIdentifier.fromPrincipal({
		principal: principal ?? identity.getPrincipal(),
		subAccount: undefined
	});
};

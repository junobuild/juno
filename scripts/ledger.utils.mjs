import { AccountIdentifier } from '@junobuild/ledger';
import { getIdentity } from './console.config.utils.mjs';

export const accountIdentifier = async (mainnet, principal) => {
	const identity = getIdentity(mainnet);

	return AccountIdentifier.fromPrincipal({
		principal: principal ?? identity.getPrincipal(),
		subAccount: undefined
	});
};

import { isNullish } from '@dfinity/utils';
import { checkAccountId } from '@icp-sdk/canisters/ledger/icp';

export const isIcpAccountIdentifier = (address: string | undefined): boolean => {
	if (isNullish(address)) {
		return false;
	}

	try {
		checkAccountId(address);
		return true;
	} catch (_: unknown) {
		// We do not parse the error
	}

	return false;
};

export const invalidIcpAddress = (address: string | undefined): boolean =>
	!isIcpAccountIdentifier(address);

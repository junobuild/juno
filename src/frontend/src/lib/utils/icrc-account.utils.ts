import { isNullish } from '@dfinity/utils';
import { decodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';

export const isIcrcAddress = (address: string | undefined): boolean => {
	if (isNullish(address)) {
		return false;
	}

	try {
		decodeIcrcAccount(address);
		return true;
	} catch (_: unknown) {
		// We do not parse the error
	}

	return false;
};

export const invalidIcrcAddress = (address: string | undefined): boolean => !isIcrcAddress(address);

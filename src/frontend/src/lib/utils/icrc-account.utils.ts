import { decodeIcrcAccount, type IcrcAccount } from '@dfinity/ledger-icrc';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';

export const getIcrcAccount = (principal: Principal): IcrcAccount => ({ owner: principal });

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

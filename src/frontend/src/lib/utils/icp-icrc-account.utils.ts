import { nonNullish } from '@dfinity/utils';
import { AccountIdentifier, SubAccount } from '@icp-sdk/canisters/ledger/icp';
import type { IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';

export const toAccountIdentifier = ({ owner, subaccount }: IcrcAccount): AccountIdentifier => {
	const sub = nonNullish(subaccount) ? SubAccount.fromBytes(subaccount) : undefined;
	return AccountIdentifier.fromPrincipal({ principal: owner, subAccount: sub });
};

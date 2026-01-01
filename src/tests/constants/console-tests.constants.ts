import type { ConsoleDid } from '$declarations';
import { toNullable } from '@dfinity/utils';
import { Principal } from '@icp-sdk/core/principal';

export const CONTROLLER_ERROR_MSG = 'Caller is not a controller of the console.';
export const ANONYMOUS_ERROR_MSG = 'Anonymous caller is not allowed.';
export const NO_ACCOUNT_ERROR_MSG = 'User does not have an account.';

export const CONSOLE_ID = Principal.fromText('cokmz-oiaaa-aaaal-aby6q-cai');

export const TEST_FEE_ICP = { e8s: 44_000_000n };

export const TEST_FEES: ConsoleDid.FeesArgs = {
	fee_icp: toNullable(TEST_FEE_ICP),
	fee_cycles: { e12s: 2_222_000_000_000n }
};

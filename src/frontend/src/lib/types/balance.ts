import type { AccountIdentifier } from '@dfinity/ledger-icp';

export interface MissionControlBalance {
	balance: bigint;
	credits: bigint;
	accountIdentifier: AccountIdentifier;
}

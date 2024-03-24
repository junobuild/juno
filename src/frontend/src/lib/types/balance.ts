import type { AccountIdentifier } from '@junobuild/ledger';

export interface MissionControlBalance {
	balance: bigint;
	credits: bigint;
	accountIdentifier: AccountIdentifier;
}

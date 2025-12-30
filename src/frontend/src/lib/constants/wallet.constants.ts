import {
	CYCLES_INDEX_CANISTER_ID,
	CYCLES_LEDGER_CANISTER_ID,
	ICP_INDEX_CANISTER_ID,
	ICP_LEDGER_CANISTER_ID
} from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import type { SelectedToken } from '$lib/schemas/wallet.schema';
import type { RelyingPartyOptions } from '@dfinity/oisy-wallet-signer';

export const MEMO_CANISTER_CREATE = BigInt(0x41455243); // == 'CREA'

export const MEMO_CANISTER_APPROVE = BigInt(0x4150524f); // == 'APRO'

/// At least for topup, it has to be exactly the memo used by the IC
export const MEMO_CANISTER_TOP_UP = BigInt(0x50555054); // == 'TPUP'

// eslint-disable-next-line no-loss-of-precision
export const MEMO_SATELLITE_CREATE_REFUND = BigInt(0x44464552544153); // == 'SATREFD'
// eslint-disable-next-line no-loss-of-precision
export const MEMO_ORBITER_CREATE_REFUND = BigInt(0x4446455242524f); // == 'ORBREFD'

export const OISY_WALLET_OPTIONS: RelyingPartyOptions = isDev()
	? {
			url: 'http://localhost:5174/sign',
			host: 'http://localhost:5987/'
		}
	: {
			url: 'https://oisy.com/sign'
		};

// From FI team:
// On mainnet, the index runs its indexing function every second. The time to see a new transaction in the index is <=1 second plus the time required by the indexing function
// (however)
// ICP Index has not been upgraded yet so right know for ICP is variable between 0 and 2 seconds. Leo has changed the ckBTC and ckETH to run every second and we want to change the ICP one too eventually. We just didn't get to work on it yet
export const INDEX_RELOAD_DELAY = 2000;

export const CYCLES_TOKEN: SelectedToken = {
	token: 'cycles',
	ledgerId: CYCLES_LEDGER_CANISTER_ID,
	indexId: CYCLES_INDEX_CANISTER_ID
};

export const ICP_TOKEN: SelectedToken = {
	token: 'icp',
	ledgerId: ICP_LEDGER_CANISTER_ID,
	indexId: ICP_INDEX_CANISTER_ID
};

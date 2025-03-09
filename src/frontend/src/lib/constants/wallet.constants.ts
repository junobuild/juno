import { DEV } from '$lib/constants/app.constants';
import type { RelyingPartyOptions } from '@dfinity/oisy-wallet-signer';

export const MEMO_CANISTER_CREATE = BigInt(0x41455243); // == 'CREA'

/// At least for topup, it has to be exactly the memo used by the IC
export const MEMO_CANISTER_TOP_UP = BigInt(0x50555054); // == 'TPUP'

// eslint-disable-next-line no-loss-of-precision
export const MEMO_SATELLITE_CREATE_REFUND = BigInt(0x44464552544153); // == 'SATREFD'
// eslint-disable-next-line no-loss-of-precision
export const MEMO_ORBITER_CREATE_REFUND = BigInt(0x4446455242524f); // == 'ORBREFD'

export const OISY_WALLET_OPTIONS: RelyingPartyOptions = DEV
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

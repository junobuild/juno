import {DEV} from "$lib/constants/constants";

export const MEMO_CANISTER_CREATE = BigInt(0x41455243); // == 'CREA'

/// At least for topup, it has to be exactly the memo used by the IC
export const MEMO_CANISTER_TOP_UP = BigInt(0x50555054); // == 'TPUP'

// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
export const MEMO_SATELLITE_CREATE_REFUND = BigInt(0x44464552544153); // == 'SATREFD'
// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
export const MEMO_ORBITER_CREATE_REFUND = BigInt(0x4446455242524f); // == 'ORBREFD'

export const OISY_WALLET_URL = DEV ? 'http://localhost:5174/sign' : 'https://oisy.com/sign';
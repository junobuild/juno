use ic_ledger_types::{Memo, Tokens};

pub const IC_TRANSACTION_FEE_ICP: Tokens = Tokens::from_e8s(10_000);

pub const CREATE_SATELLITE_CYCLES: u128 = 1_000_000_000_000;
pub const CREATE_MISSION_CONTROL_CYCLES: u128 = 1_000_000_000_000;

// Reverse (CREA -> AERC) -> ASCII -> HEX -> LittleEndian
// NNS canister create: CREA 0x41455243
// NNS canister topup: CREA 0x50555054
// SAT -> TAS = 0x544153
pub const MEMO_CANISTER_CREATE: Memo = Memo(0x41455243); // == 'CREA'

/// At least for topup, it has to be exactly the memo used by the IC
pub const MEMO_CANISTER_TOP_UP: Memo = Memo(0x50555054); // == 'TPUP'

pub const MEMO_SATELLITE_CREATE_REFUND: Memo = Memo(0x44464552544153); // == 'SATREFD'

// 10 controllers max on the IC - the canister itself and user of the console because these two are not added to the mission control state controllers
pub const MAX_NUMBER_OF_MISSION_CONTROL_CONTROLLERS: usize = 8;

// 10 controllers max on the IC. User and mission control principals are copied in satellite state controllers
pub const MAX_NUMBER_OF_SATELLITE_CONTROLLERS: usize = 10;

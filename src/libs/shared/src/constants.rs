use ic_ledger_types::{Memo, Tokens};

pub const IC_TRANSACTION_FEE_ICP: Tokens = Tokens::from_e8s(10_000);

/// Creating a canister require cycles. These varies according to the subnet size (number of nodes).
/// Check [Gas and cycles cost](https://internetcomputer.org/docs/current/developer-docs/gas-cost) for more details.
pub const CREATE_CANISTER_CYCLES: u128 = 100_000_000_000u128;

/// We create segements with additional cycles than the above bare minimum.
pub const CREATE_SATELLITE_CYCLES: u128 = 1_000_000_000_000;
pub const CREATE_MISSION_CONTROL_CYCLES: u128 = 1_000_000_000_000;
pub const CREATE_ORBITER_CYCLES: u128 = 1_000_000_000_000;

// Reverse (CREA -> AERC) -> ASCII -> HEX -> LittleEndian
// NNS canister create: CREA 0x41455243
// NNS canister topup: CREA 0x50555054
// SAT -> TAS = 0x544153

/**
* let reversed: Vec<char> = "CREA".chars().rev().collect();
* for c in reversed {
*   println!("{:#x}", c as u32);
* }
*/

pub const MEMO_CANISTER_CREATE: Memo = Memo(0x41455243); // == 'CREA'

/// At least for topup, it has to be exactly the memo used by the IC
pub const MEMO_CANISTER_TOP_UP: Memo = Memo(0x50555054); // == 'TPUP'

pub const MEMO_SATELLITE_CREATE_REFUND: Memo = Memo(0x44464552544153); // == 'SATREFD'
pub const MEMO_ORBITER_CREATE_REFUND: Memo = Memo(0x4446455242524f); // == 'ORBREFD'

// 10 controllers max on the IC - the canister itself and user of the console because these two are not added to the mission control state controllers
pub const MAX_NUMBER_OF_MISSION_CONTROL_CONTROLLERS: usize = 8;

// 10 controllers max on the IC. User and mission control principals are copied in satellite state controllers
pub const MAX_NUMBER_OF_SATELLITE_CONTROLLERS: usize = 10;

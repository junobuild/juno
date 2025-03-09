use ic_ledger_types::{Memo, Tokens};

// Specifies the transaction fee for ICP transactions.
pub const IC_TRANSACTION_FEE_ICP: Tokens = Tokens::from_e8s(10_000);

// Creating a canister require cycles. Those vary according to the subnet size (number of nodes).
// Check [Gas and cycles cost](https://internetcomputer.org/docs/current/developer-docs/gas-cost) for more details.
// Cost for creating a canister have been increased by 400% in November 2024:
// - https://forum.dfinity.org/t/evaluating-compute-pricing-in-response-to-increased-demand-on-the-internet-computer-protocol/36565
// - https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=134032
pub const CREATE_CANISTER_CYCLES: u128 = 500_000_000_000u128;

// Additional cycles allocated for creating different types of canisters to ensure operation beyond the minimum requirement.
pub const CREATE_SATELLITE_CYCLES: u128 = 1_000_000_000_000;
pub const CREATE_MISSION_CONTROL_CYCLES: u128 = 1_000_000_000_000;
pub const CREATE_ORBITER_CYCLES: u128 = 1_000_000_000_000;

// Reverse (CREA -> AERC) -> ASCII -> HEX -> LittleEndian
// NNS canister create: CREA 0x41455243
// NNS canister topup: CREA 0x50555054
// SAT -> TAS = 0x544153

// let reversed: Vec<char> = "CREA".chars().rev().collect();
// * for c in reversed {
// *   println!("{:#x}", c as u32);
// * }

// Memos for different operations, encoded from specific ASCII strings to hexadecimal values.
pub const MEMO_CANISTER_CREATE: Memo = Memo(0x41455243); // == 'CREA'
                                                         // Note: For topup, it has to be exactly the memo used by the IC
pub const MEMO_CANISTER_TOP_UP: Memo = Memo(0x50555054); // == 'TPUP'
pub const MEMO_SATELLITE_CREATE_REFUND: Memo = Memo(0x44464552544153); // == 'SATREFD'
pub const MEMO_ORBITER_CREATE_REFUND: Memo = Memo(0x4446455242524f); // == 'ORBREFD'

// 10 controllers max on the IC - the canister itself and user of the console because these two are not added to the mission control state controllers
pub const MAX_NUMBER_OF_MISSION_CONTROL_CONTROLLERS: usize = 8;

// 10 controllers max on the IC. User and mission control principals are copied in satellite state controllers
pub const MAX_NUMBER_OF_SATELLITE_CONTROLLERS: usize = 10;

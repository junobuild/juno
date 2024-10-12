use candid::{CandidType, Principal};
use ic_ledger_types::BlockIndex;
use serde::Deserialize;

pub type Cycles = u128;

#[derive(CandidType, Deserialize)]
pub enum NotifyError {
    Refunded {
        reason: String,
        block_index: Option<BlockIndex>,
    },
    InvalidTransaction(String),
    TransactionTooOld(BlockIndex),
    Processing,
    Other {
        error_code: u64,
        error_message: String,
    },
}

#[derive(CandidType, Deserialize)]
pub struct TopUpCanisterArgs {
    pub block_index: BlockIndex,
    pub canister_id: Principal,
}

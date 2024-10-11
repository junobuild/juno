use candid::CandidType;
use ic_ledger_types::{Block, BlockIndex, Memo, Operation, Timestamp};
use serde::Deserialize;

pub type BlockIndexed = (BlockIndex, Block);
pub type Blocks = Vec<BlockIndexed>;
pub type Transactions = Vec<Transaction>;

#[derive(CandidType, Deserialize, Clone)]
pub struct Transaction {
    pub block_index: BlockIndex,
    pub memo: Memo,
    pub operation: Option<Operation>,
    pub timestamp: Timestamp,
}

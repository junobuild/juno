use crate::types::ledger::{BlockIndexed, Transaction};

impl From<&BlockIndexed> for Transaction {
    fn from((block_index, block): &BlockIndexed) -> Self {
        Transaction {
            block_index: *block_index,
            memo: block.transaction.memo,
            operation: block.transaction.operation.clone(),
            timestamp: block.timestamp,
        }
    }
}

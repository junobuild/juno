use crate::types::ledger::{BlockIndexed, Transaction};
use crate::types::utils::CalendarDate;
use time::Month;

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

impl From<&(i32, Month, u8)> for CalendarDate {
    fn from((year, month, day): &(i32, Month, u8)) -> Self {
        CalendarDate {
            year: *year,
            month: *month as u8,
            day: *day,
        }
    }
}

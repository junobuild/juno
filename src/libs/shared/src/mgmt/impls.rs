use crate::mgmt::types::NotifyError;

impl std::fmt::Display for NotifyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Refunded {
                reason,
                block_index: Some(b),
            } => write!(f, "The payment was refunded in block {}: {}", b, reason),
            Self::Refunded {
                reason,
                block_index: None,
            } => write!(f, "The payment was refunded: {}", reason),
            Self::InvalidTransaction(err) => write!(f, "Failed to verify transaction: {}", err),
            Self::TransactionTooOld(bh) => write!(
                f,
                "The payment is too old, you cannot notify blocks older than block {}",
                bh
            ),
            Self::Processing => {
                write!(f, "Another notification of this transaction is in progress")
            }
            Self::Other {
                error_code,
                error_message,
            } => write!(
                f,
                "Notification failed with code {}: {}",
                error_code, error_message
            ),
        }
    }
}

use crate::mgmt::types::cmc::CreateCanisterError;

impl std::fmt::Display for CreateCanisterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Refunded {
                refund_amount,
                create_error,
            } => write!(
                f,
                "The payment for the canister creation was refunded {refund_amount}: {create_error}"
            ),
        }
    }
}

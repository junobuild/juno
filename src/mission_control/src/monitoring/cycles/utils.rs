use canfund::manager::record::{CanisterRecord, FundingErrorCode};
use junobuild_shared::types::monitoring::{CyclesBalance, FundingFailure, FundingErrorCode as InternalFundingErrorCode};

pub fn get_deposited_cycles(record: &CanisterRecord) -> Option<CyclesBalance> {
    if let Some(cycles) = record.get_cycles() {
        let last_deposited_cycles =
            record
                .get_last_deposited_cycles()
                .clone()
                .map(|last_deposited| CyclesBalance {
                    amount: last_deposited.amount,
                    timestamp: last_deposited.timestamp,
                });

        // The `last_deposited_cycles` does not correspond to the most recent monitoring round. Instead, it represents the last time the module was topped up overall.
        // Our goal is to track the history of cycles deposited specifically by the monitoring process, which requires filtering the data appropriately.
        // Since each monitoring round is optimistically expected to collect cycles with a newer timestamp than the last deposit—given that rounds are scheduled at intervals,
        // such as one hour apart—we can use a timestamp comparison to identify the information we are looking for.
        last_deposited_cycles
            .clone()
            .filter(|last_deposited| last_deposited.timestamp >= cycles.timestamp)
    } else {
        None
    }
}

pub fn get_funding_failure(record: &CanisterRecord) -> Option<FundingFailure> {
    if let Some(cycles) = record.get_cycles() {
        fn convert_funding_error_code(code: &FundingErrorCode) -> InternalFundingErrorCode {
            match code {
                FundingErrorCode::InsufficientCycles => InternalFundingErrorCode::InsufficientCycles,
                FundingErrorCode::DepositFailed => InternalFundingErrorCode::DepositFailed,
                FundingErrorCode::ObtainCyclesFailed => InternalFundingErrorCode::ObtainCyclesFailed,
                FundingErrorCode::BalanceCheckFailed => InternalFundingErrorCode::BalanceCheckFailed,
                FundingErrorCode::Other(s) => InternalFundingErrorCode::Other(s.to_string()),
            }
        }
        
        let funding_failure =
            record
                .get_funding_failure()
                .clone()
                .map(|funding_failure| FundingFailure {
                    error_code: convert_funding_error_code(&funding_failure.error_code),
                    timestamp: funding_failure.timestamp,
                });

       if let Some(funding_failure) = funding_failure {
           if funding_failure.timestamp >= cycles.timestamp {
               return Some(funding_failure);
           }
       }
    }

    None
}
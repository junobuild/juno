use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, id};
use ic_ledger_types::AccountIdentifier;
use shared::env::OBSERVATORY;
use shared::ledger::SUB_ACCOUNT;
use shared::types::interface::{ListTransactionsArgs, MissionControlId};
use shared::types::ledger::Transactions;

pub async fn list_transactions() -> Result<Transactions, String> {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();
    let mission_control_id: MissionControlId = id();

    let args = ListTransactionsArgs {
        account_identifier: AccountIdentifier::new(&mission_control_id, &SUB_ACCOUNT),
    };

    let result: CallResult<(Transactions,)> = call(observatory, "list_transactions", (args,)).await;

    match result {
        Err((_, message)) => {
            Err(["Retrieving the list of transactions failed.", &message].join(" - "))
        }
        Ok((transactions,)) => Ok(transactions),
    }
}

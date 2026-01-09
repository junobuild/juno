use crate::cycles::services::ledger::cycles::deposit_cycles as ledger_deposit_cycles;
use candid::{Nat, Principal};
use icrc_ledger_types::icrc1::account::Account;

pub async fn deposit_cycles(caller: &Principal, cycles: u128) -> Result<(), String> {
    let purchaser_account: Account = Account::from(*caller);

    ledger_deposit_cycles(purchaser_account, cycles).await?;

    Ok(())
}

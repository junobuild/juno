use crate::factory::services::ledger::icrc_transfer_from;
use candid::{Nat, Principal};
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::constants_shared::IC_TRANSACTION_FEE_CYCLES;
use junobuild_shared::env::CYCLES_LEDGER;

pub async fn transfer_from_cycles_ledger(
    purchaser: &Principal,
    canister_fee: &Tokens,
) -> Result<BlockIndex, String> {
    let transaction_fee = Nat::from(IC_TRANSACTION_FEE_CYCLES.e8s());
    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    icrc_transfer_from(purchaser, &ledger_id, canister_fee, &transaction_fee).await
}

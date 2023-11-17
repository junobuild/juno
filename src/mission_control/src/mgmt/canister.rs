use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::api::management_canister::main::CanisterId;
use ic_cdk::call;
use ic_ledger_types::{Subaccount, Tokens};
use shared::constants::{IC_TRANSACTION_FEE_ICP, MEMO_CANISTER_TOP_UP};
use shared::env::CMC;
use shared::ledger::transfer_payment;
use shared::types::cmc::{Cycles, NotifyError, TopUpCanisterArgs};

pub async fn top_up_canister(canister_id: &CanisterId, amount: &Tokens) -> Result<(), String> {
    // We need to hold back 1 transaction fee for the 'send' and also 1 for the 'notify'
    let send_amount = Tokens::from_e8s(amount.e8s() - (2 * IC_TRANSACTION_FEE_ICP.e8s()));

    let cmc = Principal::from_text(CMC).unwrap();

    let to_sub_account: Subaccount = convert_principal_to_sub_account(canister_id.as_slice());

    let block_index = transfer_payment(
        &cmc,
        &to_sub_account,
        MEMO_CANISTER_TOP_UP,
        send_amount,
        IC_TRANSACTION_FEE_ICP,
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    .map_err(|e| format!("ledger transfer error {:?}", e))?;

    let args = TopUpCanisterArgs {
        block_index,
        canister_id: *canister_id,
    };

    let result: CallResult<(Result<Cycles, NotifyError>,)> =
        call(cmc, "notify_top_up", (args,)).await;

    match result {
        Err((_, message)) => {
            // If the topup fails in the Cmc canister, it refunds the caller.
            // let was_refunded = matches!(error, NotifyError::Refunded { .. });
            Err(["Top-up failed.", &message].join(" - "))
        }
        Ok(_) => Ok(()),
    }
}

fn convert_principal_to_sub_account(principal_id: &[u8]) -> Subaccount {
    let mut bytes = [0u8; 32];
    bytes[0] = principal_id.len().try_into().unwrap();
    bytes[1..1 + principal_id.len()].copy_from_slice(principal_id);
    Subaccount(bytes)
}

use crate::cycles::services::deposit::deposit_cycles;
use crate::cycles::services::payment::process_payment_icp;
use crate::payments::{insert_new_icrc_payment, update_icrc_payment_completed};
use crate::types::interface::ConvertIcpToCyclesArgs;
use crate::types::ledger::IcrcPaymentKey;
use candid::Principal;
use ic_ledger_types::Tokens;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::cmc::top_up_canister;

pub async fn convert_icp_to_cycles(
    caller: Principal,
    args: &ConvertIcpToCyclesArgs,
) -> Result<(), String> {
    // Transfer from wallet to Console
    let (ledger_id, purchaser_payment_block_index) =
        process_payment_icp(&args.from, &args.amount).await?;

    // We acknowledge the new payment
    let payment_key = IcrcPaymentKey::from(&ledger_id, &purchaser_payment_block_index);

    insert_new_icrc_payment(&payment_key, &caller)?;

    // The ICP are converted in cycles with a top-up
    let tokens: Tokens = Tokens::from_e8s(
        u64::try_from(args.amount.0.clone()).map_err(|_| "Amount too large for u64")?,
    );

    let topped_up_cycles = top_up_canister(&id(), &tokens).await?;

    // TODO: refund on error

    // Finally the cycles are deposited
    deposit_cycles(&caller, topped_up_cycles).await?;

    // TODO: on error?

    // Mark payment as fully processed
    update_icrc_payment_completed(&payment_key)?;

    Ok(())
}

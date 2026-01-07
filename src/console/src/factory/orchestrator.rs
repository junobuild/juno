use crate::accounts::{
    credits::{has_credits, use_credits},
    get_existing_account,
};
use crate::factory::services::payment::{
    process_payment_cycles, process_payment_icp, refund_payment_cycles, refund_payment_icp,
};
use crate::factory::types::{CanisterCreator, CreateSegmentArgs};
use crate::fees::types::FeeKind;
use crate::payments::{
    insert_new_icrc_payment, update_icrc_payment_completed, update_icrc_payment_refunded,
};
use crate::types::ledger::{Fee, IcrcPayment, IcrcPaymentKey};
use crate::types::state::Account;
use candid::Principal;
use ic_ledger_types::BlockIndex;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::state::UserId;
use junobuild_shared::utils::principal_equal;
use std::future::Future;

pub async fn create_segment_workflow<F, Fut>(
    create: F,
    increment_rate: &dyn Fn() -> Result<(), String>,
    get_fee: &dyn Fn(FeeKind) -> Result<Fee, String>,
    add_segment: &dyn Fn(&UserId, &Principal),
    caller: Principal,
    user: UserId,
    args: CreateSegmentArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let account = get_existing_account(&user)?;

    if principal_equal(caller, account.owner) {
        // Caller is user
        let creator: CanisterCreator =
            CanisterCreator::User((account.owner, account.mission_control_id));

        let canister_id = create_segment_with_account(
            create,
            process_payment_cycles,
            refund_payment_cycles,
            increment_rate,
            get_fee(FeeKind::Cycles)?,
            &account,
            creator,
            args,
        )
        .await?;

        add_segment(&account.owner, &canister_id);

        return Ok(canister_id);
    }

    let mission_control_id = account
        .mission_control_id
        .ok_or("No mission control center found.".to_string())?;

    if principal_equal(caller, mission_control_id) {
        // Caller is mission control
        let creator: CanisterCreator =
            CanisterCreator::MissionControl((mission_control_id, account.owner));

        let canister_id = create_segment_with_account(
            create,
            process_payment_icp,
            refund_payment_icp,
            increment_rate,
            get_fee(FeeKind::ICP)?,
            &account,
            creator,
            args,
        )
        .await?;

        add_segment(&account.owner, &canister_id);

        return Ok(canister_id);
    }

    Err("Unknown caller".to_string())
}

pub async fn create_segment_with_account<F, Fut, P, Pay, R, Refund>(
    create: F,
    process_payment: P,
    refund_payment: R,
    increment_rate: &dyn Fn() -> Result<(), String>,
    fee: Fee,
    account: &Account,
    creator: CanisterCreator,
    args: CreateSegmentArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
    P: FnOnce(Principal, Option<BlockIndex>, Fee) -> Pay,
    Pay: Future<Output = Result<(Principal, BlockIndex), String>>,
    R: FnOnce(Principal, Fee) -> Refund,
    Refund: Future<Output = Result<BlockIndex, String>>,
{
    if has_credits(account, &fee) {
        // Guard too many requests
        increment_rate()?;

        return create_segment_with_credits(create, creator, args).await;
    }

    create_segment_with_payment(create, process_payment, refund_payment, creator, args, fee).await
}

async fn create_segment_with_credits<F, Fut>(
    create: F,
    creator: CanisterCreator,
    CreateSegmentArgs { subnet_id, .. }: CreateSegmentArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let account_owner = *creator.account_owner();

    // Effectively create the Satellite, Mission control, Orbiter etc.
    let create_segment_result = create(creator, subnet_id).await;

    match create_segment_result {
        Err(_) => Err("Segment creation with credits failed.".to_string()),
        Ok(satellite_id) => {
            // Satellite or orbiter is created we can use the credits
            let credits = use_credits(&account_owner);

            match credits {
                Err(e) => Err(e.to_string()),
                Ok(_) => Ok(satellite_id),
            }
        }
    }
}

async fn refund_segment_creation<R, Refund>(
    refund_payment: R,
    purchaser: &Principal,
    payment_key: &IcrcPaymentKey,
    fee: Fee,
) -> Result<IcrcPayment, String>
where
    R: FnOnce(Principal, Fee) -> Refund,
    Refund: Future<Output = Result<BlockIndex, String>>,
{
    let refund_block_index = refund_payment(purchaser.clone(), fee).await?;

    // We record the refund in the payment list
    update_icrc_payment_refunded(payment_key, &refund_block_index)
        .map_err(|e| format!("Insert refund transaction error {e:?}"))
}

async fn create_segment_with_payment<F, Fut, P, Pay, R, Refund>(
    create: F,
    process_payment: P,
    refund_payment: R,
    creator: CanisterCreator,
    CreateSegmentArgs {
        block_index,
        subnet_id,
    }: CreateSegmentArgs,
    fee: Fee,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
    P: FnOnce(Principal, Option<BlockIndex>, Fee) -> Pay,
    Pay: Future<Output = Result<(Principal, BlockIndex), String>>,
    R: FnOnce(Principal, Fee) -> Refund,
    Refund: Future<Output = Result<BlockIndex, String>>,
{
    let purchaser = *creator.purchaser();

    let (ledger_id, purchaser_payment_block_index) =
        process_payment(purchaser, block_index, fee.clone()).await?;

    let payment_key = IcrcPaymentKey::from(&ledger_id, &purchaser_payment_block_index);

    // We acknowledge the new payment
    insert_new_icrc_payment(&payment_key, &purchaser)?;

    // Create the canister (satellite or orbiter)
    let create_canister_result = create(creator, subnet_id).await;

    match create_canister_result {
        Err(error) => {
            refund_segment_creation(refund_payment, &purchaser, &payment_key, fee).await?;

            Err(["Segment creation failed. Buyer has been refunded.", &error].join(" - "))
        }
        Ok(satellite_id) => {
            // Satellite or orbiter is created, we can update the payment has being processed
            update_icrc_payment_completed(&payment_key)?;

            Ok(satellite_id)
        }
    }
}

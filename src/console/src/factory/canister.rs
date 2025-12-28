use crate::accounts::{
    credits::{has_credits, use_credits},
    get_existing_account,
};
use crate::factory::services::ledger::icp::{refund_payment, verify_payment};
use crate::factory::services::ledger::icrc::transfer_from;
use crate::factory::types::{CanisterCreator, CreateCanisterArgs};
use crate::store::stable::{
    insert_new_payment, is_known_payment, update_payment_completed, update_payment_refunded,
};
use crate::types::ledger::Payment;
use crate::types::state::Account;
use candid::Principal;
use ic_ledger_types::{BlockIndex, Tokens};
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::state::UserId;
use junobuild_shared::utils::principal_equal;
use std::future::Future;

pub async fn create_canister<F, Fut>(
    create: F,
    increment_rate: &dyn Fn() -> Result<(), String>,
    get_fee: &dyn Fn() -> Result<Tokens, String>,
    add_segment: &dyn Fn(&UserId, &Principal),
    caller: Principal,
    user: UserId,
    args: CreateCanisterArgs,
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

        let canister_id =
            create_canister_with_account(create, increment_rate, get_fee, &account, creator, args)
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

        let canister_id =
            create_canister_with_account(create, increment_rate, get_fee, &account, creator, args)
                .await?;

        add_segment(&account.owner, &canister_id);

        return Ok(canister_id);
    }

    Err("Unknown caller".to_string())
}

pub async fn create_canister_with_account<F, Fut>(
    create: F,
    increment_rate: &dyn Fn() -> Result<(), String>,
    get_fee: &dyn Fn() -> Result<Tokens, String>,
    account: &Account,
    creator: CanisterCreator,
    args: CreateCanisterArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let fee = get_fee()?;

    if has_credits(account, &fee) {
        // Guard too many requests
        increment_rate()?;

        return create_canister_with_credits(create, creator, args).await;
    }

    create_canister_with_payment(create, creator, args, fee).await
}

async fn create_canister_with_credits<F, Fut>(
    create: F,
    creator: CanisterCreator,
    CreateCanisterArgs { subnet_id, .. }: CreateCanisterArgs,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let account_owner = *creator.account_owner();

    // Create the satellite
    let create_canister_result = create(creator, subnet_id).await;

    match create_canister_result {
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

async fn create_canister_with_payment<F, Fut>(
    create: F,
    creator: CanisterCreator,
    CreateCanisterArgs {
        block_index,
        subnet_id,
    }: CreateCanisterArgs,
    fee: Tokens,
) -> Result<Principal, String>
where
    F: FnOnce(CanisterCreator, Option<SubnetId>) -> Fut,
    Fut: Future<Output = Result<Principal, String>>,
{
    let purchaser = *creator.purchaser();

    let purchaser_payment_block_index = if let Some(block_index) = block_index {
        if is_known_payment(&block_index) {
            return Err("Payment has been or is being processed.".to_string());
        }

        verify_payment(&purchaser, &block_index, fee).await?
    } else {
        transfer_from(&purchaser, &fee).await?
    };

    // We acknowledge the new payment
    insert_new_payment(&purchaser, &purchaser_payment_block_index)?;

    // Create the canister (satellite or orbiter)
    let create_canister_result = create(creator, subnet_id).await;

    match create_canister_result {
        Err(error) => {
            refund_canister_creation(&purchaser, &purchaser_payment_block_index, fee).await?;

            Err(["Canister creation failed. Buyer has been refunded.", &error].join(" - "))
        }
        Ok(satellite_id) => {
            // Satellite or orbiter is created, we can update the payment has being processed
            update_payment_completed(&purchaser_payment_block_index)?;

            Ok(satellite_id)
        }
    }
}

async fn refund_canister_creation(
    purchaser: &Principal,
    purchaser_payment_block_index: &BlockIndex,
    fee: Tokens,
) -> Result<Payment, String> {
    let refund_block_index = refund_payment(purchaser, fee).await?;

    // We record the refund in the payment list
    update_payment_refunded(purchaser_payment_block_index, &refund_block_index)
        .map_err(|e| format!("Insert refund transaction error {e:?}"))
}

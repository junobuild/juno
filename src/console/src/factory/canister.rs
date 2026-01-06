use candid::{Nat, Principal};
use junobuild_shared::constants::shared::CREATE_MISSION_CONTROL_CYCLES;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::cmc::{cmc_create_canister_install_code, create_canister_with_cmc};
use junobuild_shared::mgmt::ic::{create_canister_install_code, create_canister_with_ic_mgmt};
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::{CreateCanisterArgs};
use junobuild_shared::types::state::{SegmentKind, UserId};
use crate::accounts::get_existing_account;
use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::orchestrator::create_segment_with_account;
use crate::factory::services::payment::{process_payment_cycles, refund_payment_cycles};
use crate::factory::types::CanisterCreator;
use crate::factory::utils::controllers::update_mission_control_controllers;
use crate::factory::utils::wasm::mission_control_wasm_arg;
use crate::fees::get_factory_fee;
use crate::rates::{increment_canister_rate};
use crate::segments::add_segment as add_segment_store;
use crate::types::ledger::Fee;
use crate::types::state::{Segment, SegmentKey, StorableSegmentKind};

pub async fn create_canister(
    caller: Principal,
    args: CreateCanisterArgs,
) -> Result<Principal, String> {
    let account = get_existing_account(&caller)?;

    let creator: CanisterCreator = CanisterCreator::User((account.owner, None));

    let fee = get_factory_fee(&SegmentKind::Canister)?.fee_cycles;

    let canister_id = create_segment_with_account(
        create_raw_canister,
        process_payment_cycles,
        refund_payment_cycles,
        &increment_canister_rate,
        Fee::Cycles(fee),
        &account,
        creator,
        args.into(),
    )
        .await?;

    add_segment(&account.owner, &canister_id);
    
    Ok(canister_id)
}

async fn create_raw_canister(
    creator: CanisterCreator,
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String> {
    let CanisterCreator::User((user_id, _)) = creator else {
        return Err("Mission Control cannot create a raw canister".to_string());
    };

    // We temporarily use the Console as a controller to create the canister but
    // remove it as soon as it is spin.
    let temporary_init_controllers = Vec::from([id(), user_id]);

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: temporary_init_controllers,
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_ONE_YEAR),
    };

    let mission_control_id = if let Some(subnet_id) = subnet_id {
        create_canister_with_cmc(
            &create_settings_arg,
            CREATE_MISSION_CONTROL_CYCLES,
            &subnet_id,
        )
            .await
    } else {
        create_canister_with_ic_mgmt(
            &create_settings_arg,
            CREATE_MISSION_CONTROL_CYCLES,
        )
            .await
    }?;

    update_mission_control_controllers(&mission_control_id, &user_id).await?;

    Ok(mission_control_id)
}


fn add_segment(user: &UserId, canister_id: &Principal) {
    let canister = Segment::new(canister_id, None);
    let key = SegmentKey::from(user, canister_id, StorableSegmentKind::Canister);
    add_segment_store(&key, &canister)
}
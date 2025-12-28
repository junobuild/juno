use crate::constants::FREEZING_THRESHOLD_THREE_MONTHS;
use crate::factory::canister::create_canister;
use crate::factory::types::CanisterCreator;
use crate::factory::utils::controllers::remove_console_controller;
use crate::factory::utils::wasm::orbiter_wasm_arg;
use crate::store::heap::{get_orbiter_fee, increment_orbiters_rate};
use crate::store::stable::add_segment as add_segment_store;
use crate::types::state::{Segment, SegmentKey, SegmentType};
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_ORBITER_CYCLES;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::cmc::cmc_create_canister_install_code;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::CreateOrbiterArgs;
use junobuild_shared::types::state::UserId;

pub async fn create_orbiter(
    caller: Principal,
    args: CreateOrbiterArgs,
) -> Result<Principal, String> {
    create_canister(
        create_orbiter_wasm,
        &increment_orbiters_rate,
        &get_orbiter_fee,
        &add_segment,
        caller,
        args.user,
        args.into(),
    )
    .await
}

async fn create_orbiter_wasm(
    creator: CanisterCreator,
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String> {
    let controllers = creator.controllers();

    let wasm_arg = orbiter_wasm_arg(&controllers)?;

    // We temporarily use the Console as a controller to create the canister but
    // remove it as soon as it is spin.
    let temporary_init_controllers = [id()].into_iter().chain(controllers.clone()).collect();

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: temporary_init_controllers,
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_THREE_MONTHS),
    };

    let result = if let Some(subnet_id) = subnet_id {
        cmc_create_canister_install_code(
            &create_settings_arg,
            &wasm_arg,
            CREATE_ORBITER_CYCLES,
            &subnet_id,
        )
        .await
    } else {
        create_canister_install_code(&create_settings_arg, &wasm_arg, CREATE_ORBITER_CYCLES).await
    };

    match result {
        Err(error) => Err(error),
        Ok(orbiter_id) => {
            remove_console_controller(&orbiter_id, &controllers).await?;
            Ok(orbiter_id)
        }
    }
}

fn add_segment(user: &UserId, canister_id: &Principal) {
    let orbiter = Segment::from(canister_id, &None);
    let key = SegmentKey::from(user, canister_id, SegmentType::Orbiter);
    add_segment_store(&key, &orbiter)
}

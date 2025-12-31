use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::canister::create_canister;
use crate::factory::types::{CanisterCreator, FeeKind};
use crate::factory::utils::controllers::remove_console_controller;
use crate::factory::utils::wasm::satellite_wasm_arg;
use crate::fees::get_factory_fee;
use crate::store::heap::increment_satellites_rate;
use crate::store::stable::add_segment as add_segment_store;
use crate::types::ledger::Fee;
use crate::types::state::{Segment, SegmentKey, SegmentType};
use candid::{Nat, Principal};
use junobuild_shared::constants_shared::CREATE_SATELLITE_CYCLES;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::cmc::cmc_create_canister_install_code;
use junobuild_shared::mgmt::ic::create_canister_install_code;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::{CreateSatelliteArgs, InitStorageArgs};
use junobuild_shared::types::state::{SegmentKind, UserId};

pub async fn create_satellite(
    caller: Principal,
    args: CreateSatelliteArgs,
) -> Result<Principal, String> {
    let storage = args.storage.clone();
    let name = args.name.clone();

    create_canister(
        move |creator, subnet_id| async move {
            create_satellite_wasm(creator, subnet_id, storage).await
        },
        &increment_satellites_rate,
        &get_fee,
        &move |used_id, canister_id| add_segment(used_id, canister_id, &name),
        caller,
        args.user,
        args.into(),
    )
    .await
}

fn get_fee(fee_kind: FeeKind) -> Result<Fee, String> {
    let fee = get_factory_fee(&SegmentKind::Satellite)?;

    let value = match fee_kind {
        FeeKind::Cycles => Fee::Cycles(fee.fee_cycles),
        FeeKind::ICP => Fee::ICP(fee.fee_icp),
    };

    Ok(value)
}

async fn create_satellite_wasm(
    creator: CanisterCreator,
    subnet_id: Option<SubnetId>,
    storage: Option<InitStorageArgs>,
) -> Result<Principal, String> {
    let controllers = creator.controllers();

    let wasm_arg = satellite_wasm_arg(&controllers, storage)?;

    // We temporarily use the Console as a controller to create the canister but
    // remove it as soon as it is spin.
    let temporary_init_controllers = [id()].into_iter().chain(controllers.clone()).collect();

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: temporary_init_controllers,
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_ONE_YEAR),
    };

    let result = if let Some(subnet_id) = subnet_id {
        cmc_create_canister_install_code(
            &create_settings_arg,
            &wasm_arg,
            CREATE_SATELLITE_CYCLES,
            &subnet_id,
        )
        .await
    } else {
        create_canister_install_code(&create_settings_arg, &wasm_arg, CREATE_SATELLITE_CYCLES).await
    };

    match result {
        Err(error) => Err(error),
        Ok(satellite_id) => {
            remove_console_controller(&satellite_id, &controllers).await?;
            Ok(satellite_id)
        }
    }
}

fn add_segment(user: &UserId, canister_id: &Principal, name: &Option<String>) {
    let satellite = Segment::from(canister_id, name);
    let key = SegmentKey::from(user, canister_id, SegmentType::Satellite);
    add_segment_store(&key, &satellite)
}

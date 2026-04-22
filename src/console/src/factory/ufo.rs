use crate::accounts::get_existing_account;
use crate::constants::FREEZING_THRESHOLD_ONE_YEAR;
use crate::factory::orchestrator::create_segment_with_account;
use crate::factory::services::payment::{process_payment_cycles, refund_payment_cycles};
use crate::factory::types::CanisterCreator;
use crate::factory::utils::controllers::{
    remove_console_controller,
};
use crate::fees::get_factory_fee;
use crate::rates::increment_ufo_rate;
use crate::segments::add_segment as add_segment_store;
use crate::types::ledger::Fee;
use crate::types::state::{Segment, SegmentKey, StorableSegmentKind};
use candid::{Nat, Principal};
use junobuild_shared::constants::shared::CREATE_UFO_CYCLES;
use junobuild_shared::ic::api::id;
use junobuild_shared::mgmt::cmc::create_canister_with_cmc;
use junobuild_shared::mgmt::ic::create_canister_with_ic_mgmt;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::mgmt::types::ic::CreateCanisterInitSettingsArg;
use junobuild_shared::types::interface::CreateUfoArgs;
use junobuild_shared::types::state::{SegmentKind, UserId};

pub async fn create_ufo(caller: Principal, args: CreateUfoArgs) -> Result<Principal, String> {
    let account = get_existing_account(&caller)?;

    let name = args.name.clone();
    let creator: CanisterCreator = CanisterCreator::User((account.owner, None));

    let fee = get_factory_fee(&SegmentKind::Ufo)?.fee_cycles;

    let canister_id = create_segment_with_account(
        create_raw_canister,
        process_payment_cycles,
        refund_payment_cycles,
        &increment_ufo_rate,
        Fee::Cycles(fee),
        &account,
        creator,
        args.into(),
    )
    .await?;

    add_segment(&account.owner, &canister_id, &name);

    Ok(canister_id)
}

async fn create_raw_canister(
    creator: CanisterCreator,
    subnet_id: Option<SubnetId>,
) -> Result<Principal, String> {
    let CanisterCreator::User(_) = creator else {
        return Err("Mission Control cannot create an UFO".to_string());
    };

    let controllers = creator.controllers();

    // We temporarily use the Console as a controller to create the canister but
    // remove it as soon as it is spin.
    let temporary_init_controllers = [id()].into_iter().chain(controllers.clone()).collect();

    let create_settings_arg = CreateCanisterInitSettingsArg {
        controllers: temporary_init_controllers,
        freezing_threshold: Nat::from(FREEZING_THRESHOLD_ONE_YEAR),
    };

    let ufo_id = if let Some(subnet_id) = subnet_id {
        create_canister_with_cmc(&create_settings_arg, CREATE_UFO_CYCLES, &subnet_id).await
    } else {
        create_canister_with_ic_mgmt(&create_settings_arg, CREATE_UFO_CYCLES).await
    }?;

    remove_console_controller(&ufo_id, &controllers).await?;

    Ok(ufo_id)
}

fn add_segment(user: &UserId, canister_id: &Principal, name: &Option<String>) {
    let metadata = Segment::init_metadata(name);
    let canister = Segment::new(canister_id, Some(metadata));
    let key = SegmentKey::from(user, canister_id, StorableSegmentKind::Ufo);
    add_segment_store(&key, &canister)
}

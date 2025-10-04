use crate::factory::mission_control::init_user_mission_control;
use crate::guards::{caller_is_admin_controller, caller_is_observatory};
use crate::store::stable::{
    get_existing_mission_control, get_mission_control, init_owner_account_from_webauthn,
    list_mission_controls, owner_id_of,
};
use crate::types::interface::InitMissionControlArgs;
use crate::types::state::{AuthProvider, MissionControl, MissionControls};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::api::{caller, id};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::AssertMissionControlCenterArgs;

#[deprecated(note = "Use lookup_mission_control instead")]
#[query]
fn get_user_mission_control_center() -> Option<MissionControl> {
    let caller = caller();
    get_mission_control(&caller).unwrap_or_trap()
}

#[query]
fn lookup_mission_control() -> Option<MissionControl> {
    let caller = caller();

    let mission_control = get_mission_control(&caller).unwrap_or_trap();

    if mission_control.is_some() {
        return mission_control;
    }

    let owner_id = owner_id_of(&caller);

    if let Some(owner_id) = owner_id {
        return get_mission_control(&owner_id).unwrap_or_trap();
    }

    None
}

#[query(guard = "caller_is_observatory")]
fn assert_mission_control_center(
    AssertMissionControlCenterArgs {
        user,
        mission_control_id,
    }: AssertMissionControlCenterArgs,
) {
    get_existing_mission_control(&user, &mission_control_id).unwrap_or_trap();
}

#[query(guard = "caller_is_admin_controller")]
fn list_user_mission_control_centers() -> MissionControls {
    list_mission_controls()
}

#[deprecated(note = "Use init_mission_control instead")]
#[update]
async fn init_user_mission_control_center() -> MissionControl {
    let caller = caller();
    let console = id();

    init_user_mission_control(&console, &caller)
        .await
        .unwrap_or_trap()
}

#[update]
async fn init_mission_control(
    InitMissionControlArgs { provider }: InitMissionControlArgs,
) -> MissionControl {
    let caller = caller();
    let console = id();

    // We currently do not create accounts for Internet Identity.
    // This choice is for backwards compatibility, since accounts were introduced later.
    if let AuthProvider::WebAuthn(webauthn_data) = provider {
        init_owner_account_from_webauthn(&caller, &webauthn_data);
    }

    init_user_mission_control(&console, &caller)
        .await
        .unwrap_or_trap()
}

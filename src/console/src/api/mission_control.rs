use crate::factory::mission_control::init_user_mission_control;
use crate::guards::{caller_is_admin_controller, caller_is_observatory};
use crate::store::stable::{get_existing_mission_control, main_user_id_of, get_mission_control, list_mission_controls};
use crate::types::state::{MissionControl, MissionControls};
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::api::{caller, id};
use junobuild_shared::types::interface::AssertMissionControlCenterArgs;

#[query]
fn get_user_mission_control_center() -> Option<MissionControl> {
    let caller = caller();
    let result = get_mission_control(&caller);

    match result {
        Ok(mission_control) => mission_control,
        Err(error) => trap(error),
    }
}

#[query]
fn lookup_user_mission_control_center() -> Option<MissionControl> {
    let caller = caller();

    let main_mission_control = get_mission_control(&caller).unwrap_or_else(|e| trap(e));

    if main_mission_control.is_some() {
        return main_mission_control;
    }

    let main_user_id = main_user_id_of(&caller);

    if let Some(main_user_id) = main_user_id {
        let mission_control = get_mission_control(&main_user_id).unwrap_or_else(|e| trap(e));
        return mission_control;
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
    get_existing_mission_control(&user, &mission_control_id).unwrap_or_else(|e| trap(e));
}

#[query(guard = "caller_is_admin_controller")]
fn list_user_mission_control_centers() -> MissionControls {
    list_mission_controls()
}

#[update]
async fn init_user_mission_control_center() -> MissionControl {
    let caller = caller();
    let console = id();

    init_user_mission_control(&console, &caller)
        .await
        .unwrap_or_else(|e| trap(&e))
}

use crate::factory::mission_control::init_user_mission_control;
use crate::store::stable::{
    get_existing_mission_control, get_mission_control, list_mission_controls,
};
use crate::types::state::{MissionControl, MissionControls};
use ic_cdk::{caller, id, trap};
use ic_cdk_macros::{query, update};
use junobuild_shared::types::interface::AssertMissionControlCenterArgs;
use crate::guards::{caller_is_admin_controller, caller_is_observatory};

#[query]
fn get_user_mission_control_center() -> Option<MissionControl> {
    let caller = caller();
    let result = get_mission_control(&caller);

    match result {
        Ok(mission_control) => mission_control,
        Err(error) => trap(error),
    }
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

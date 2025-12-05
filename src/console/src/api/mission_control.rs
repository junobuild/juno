use crate::guards::caller_is_observatory;
use crate::store::stable::get_account_with_existing_mission_control;
use ic_cdk_macros::query;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::AssertMissionControlCenterArgs;

#[query(guard = "caller_is_observatory")]
fn assert_mission_control_center(
    AssertMissionControlCenterArgs {
        user,
        mission_control_id,
    }: AssertMissionControlCenterArgs,
) {
    get_account_with_existing_mission_control(&user, &mission_control_id).unwrap_or_trap();
}

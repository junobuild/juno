use crate::factory::mission_control::init_user_mission_control_with_caller;
use crate::guards::caller_is_observatory;
use crate::store::stable::get_account_with_existing_mission_control;
use crate::types::state::Account;
use ic_cdk_macros::{query, update};
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

#[update]
async fn init_user_mission_control_center() -> Account {
    init_user_mission_control_with_caller()
        .await
        .unwrap_or_trap()
}

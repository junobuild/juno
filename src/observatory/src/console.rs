use candid::Principal;
use ic_cdk::call::Call;
use junobuild_shared::env::CONSOLE;
use junobuild_shared::ic::DecodeCandid;
use junobuild_shared::types::interface::AssertMissionControlCenterArgs;
use junobuild_shared::types::state::{MissionControlId, UserId};

pub async fn assert_mission_control_center(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<(), String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = AssertMissionControlCenterArgs {
        user: *user,
        mission_control_id: *mission_control_id,
    };

    let _ = Call::bounded_wait(console, "assert_mission_control_center")
        .with_arg(args)
        .await
        .decode_candid::<()>()?;

    Ok(())
}

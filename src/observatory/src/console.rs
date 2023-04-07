use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, caller};
use shared::env::CONSOLE;
use shared::types::interface::AssertMissionControlCenterArgs;
use shared::types::state::MissionControlId;

pub async fn assert_mission_control_center(
    mission_control_id: &MissionControlId,
) -> Result<(), String> {
    let user = caller();

    let console = Principal::from_text(CONSOLE).unwrap();

    let args = AssertMissionControlCenterArgs {
        user,
        mission_control_id: *mission_control_id,
    };

    let result: CallResult<((),)> = call(console, "assert_mission_control_center", (args,)).await;

    match result {
        Err((_, message)) => Err(["Mission control is unknown.", &message].join(" - ")),
        Ok((_,)) => Ok(()),
    }
}

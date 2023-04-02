use crate::store::get_mission_control;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::env::OBSERVATORY;
use shared::types::interface::SetNotificationsArgs;
use shared::types::notifications::NotificationsConfig;
use shared::types::state::MissionControlId;

pub async fn set_observatory_notifications(
    caller: &Principal,
    config: &NotificationsConfig,
) -> Result<(), String> {
    let result = get_mission_control(caller);

    match result {
        Ok(result) => match result {
            None => Err("Caller has no mission control.".to_string()),
            Some(mission_control) => match mission_control.mission_control_id {
                None => Err("Mission control ID is not (yet) set.".to_string()),
                Some(mission_control_id) => set_notifications(&mission_control_id, config).await,
            },
        },
        Err(error) => Err(error.to_string()),
    }
}

pub async fn set_notifications(
    mission_control_id: &MissionControlId,
    config: &NotificationsConfig,
) -> Result<(), String> {
    let console = Principal::from_text(OBSERVATORY).unwrap();

    let args = SetNotificationsArgs {
        mission_control_id: *mission_control_id,
        config: config.clone(),
    };

    let result: CallResult<((),)> = call(console, "set_notifications", (args,)).await;

    match result {
        Err((_, message)) => Err(["Cannot set observatory notifications.", &message].join(" - ")),
        Ok((_,)) => Ok(()),
    }
}

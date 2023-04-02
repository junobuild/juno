use crate::store::get_mission_control;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::env::OBSERVATORY;
use shared::types::cronjob::CronJobs;
use shared::types::interface::SetCronJobsArgs;
use shared::types::state::MissionControlId;

pub async fn set_observatory_cron_jobs(
    caller: &Principal,
    config: &CronJobs,
) -> Result<(), String> {
    let result = get_mission_control(caller);

    match result {
        Ok(result) => match result {
            None => Err("Caller has no mission control.".to_string()),
            Some(mission_control) => match mission_control.mission_control_id {
                None => Err("Mission control ID is not (yet) set.".to_string()),
                Some(mission_control_id) => set_cron_jobs(&mission_control_id, config).await,
            },
        },
        Err(error) => Err(error.to_string()),
    }
}

async fn set_cron_jobs(
    mission_control_id: &MissionControlId,
    config: &CronJobs,
) -> Result<(), String> {
    let console = Principal::from_text(OBSERVATORY).unwrap();

    let args = SetCronJobsArgs {
        mission_control_id: *mission_control_id,
        cron_jobs: config.clone(),
    };

    let result: CallResult<((),)> = call(console, "set_cron_jobs", (args,)).await;

    match result {
        Err((_, message)) => Err(["Cannot set observatory cron jobs.", &message].join(" - ")),
        Ok((_,)) => Ok(()),
    }
}

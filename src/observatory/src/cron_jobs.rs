use crate::store::{get_cron_jobs, set_statuses};
use crate::types::state::CronJobsConfig;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, spawn};
use shared::types::interface::{SegmentsStatus, StatusesArgs};
use shared::types::state::MissionControlId;
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

pub fn spawn_mission_controls_cron_jobs() {
    let cycles_cron_jobs: Vec<(MissionControlId, CronJobsConfig)> = get_cron_jobs()
        .into_iter()
        .filter(|(_, config)| config.cron_jobs.statuses.enabled)
        .collect();

    for (_, cron_jobs) in cycles_cron_jobs {
        spawn(collect_statuses(cron_jobs))
    }
}

async fn collect_statuses(cron_jobs: CronJobsConfig) {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        let result = statuses(&cron_jobs).await;

        set_statuses(&cron_jobs.mission_control_id, &result);
    }
}

async fn statuses(cron_jobs: &CronJobsConfig) -> Result<SegmentsStatus, String> {
    let args = StatusesArgs {
        cycles_threshold: cron_jobs.cron_jobs.statuses.cycles_threshold,
    };

    let result: CallResult<(SegmentsStatus,)> =
        call(cron_jobs.mission_control_id, "statuses", (args,)).await;

    match result {
        Err((_, message)) => Err(["Cannot get mission control statuses.", &message].join(" - ")),
        Ok((result,)) => Ok(result),
    }
}

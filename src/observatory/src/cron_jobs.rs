use crate::store::{get_cron_tabs, set_statuses};
use crate::types::state::CronTab;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, spawn};
use lazy_static::lazy_static;
use shared::types::interface::StatusesArgs;
use shared::types::state::{SegmentsStatuses, UserId};
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

pub fn cron_jobs() {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        let statuses_cron_tabs: Vec<(UserId, CronTab)> = get_cron_tabs()
            .into_iter()
            .filter(|(_, config)| config.cron_jobs.statuses.enabled)
            .collect();

        for (user, cron_tab) in statuses_cron_tabs {
            spawn(collect_statuses(user, cron_tab))
        }
    }
}

async fn collect_statuses(user: UserId, cron_tab: CronTab) {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        let result = statuses(&cron_tab).await;

        set_statuses(&user, &result);
    }
}

async fn statuses(cron_tab: &CronTab) -> Result<SegmentsStatuses, String> {
    let args = StatusesArgs {
        cycles_threshold: cron_tab.cron_jobs.statuses.cycles_threshold,
        mission_control_cycles_threshold: cron_tab
            .cron_jobs
            .statuses
            .mission_control_cycles_threshold,
        satellites: cron_tab.cron_jobs.statuses.satellites.clone(),
        orbiters: cron_tab.cron_jobs.statuses.orbiters.clone(),
    };

    let result: CallResult<(SegmentsStatuses,)> =
        call(cron_tab.mission_control_id, "status", (args,)).await;

    match result {
        Err((_, message)) => Err(["Cannot get mission control statuses.", &message].join(" - ")),
        Ok((result,)) => Ok(result),
    }
}

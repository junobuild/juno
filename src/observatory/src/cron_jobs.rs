use crate::constants::CYCLES_MIN_THRESHOLD;
use crate::store::{get_cron_tabs, set_statuses};
use crate::types::state::CronTab;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, print, spawn};
use lazy_static::lazy_static;
use shared::types::interface::{SegmentsStatuses, StatusesArgs};
use shared::types::state::UserId;
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

pub fn cron_jobs() {
    print(format!("Cron: start"));

    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        let statuses_cron_tabs: Vec<(UserId, CronTab)> = get_cron_tabs()
            .into_iter()
            .filter(|(_, config)| config.cron_jobs.statuses.enabled)
            .collect();

        print(format!("Statuses: {:?}", statuses_cron_tabs.len()));

        for (user, cron_tab) in statuses_cron_tabs {
            spawn(collect_statuses(user, cron_tab))
        }
    }

    print(format!("Cron: end"));
}

async fn collect_statuses(user: UserId, cron_tab: CronTab) {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        print(format!("Collect: start"));

        let result = statuses(&cron_tab).await;

        set_statuses(&user, &result);

        print(format!("Collect: end"));
    }
}

async fn statuses(cron_tab: &CronTab) -> Result<SegmentsStatuses, String> {
    let cycles_threshold = match cron_tab.cron_jobs.statuses.cycles_threshold {
        None => CYCLES_MIN_THRESHOLD,
        Some(threshold) => {
            if threshold < CYCLES_MIN_THRESHOLD {
                CYCLES_MIN_THRESHOLD
            } else {
                threshold
            }
        }
    };

    let args = StatusesArgs { cycles_threshold };

    let result: CallResult<(SegmentsStatuses,)> =
        call(cron_tab.mission_control_id, "status", (args,)).await;

    match result {
        Err((_, message)) => Err(["Cannot get mission control statuses.", &message].join(" - ")),
        Ok((result,)) => Ok(result),
    }
}

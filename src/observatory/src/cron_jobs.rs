use crate::store::{get_cron_tabs, set_statuses};
use crate::types::state::CronTab;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, spawn};
use lazy_static::lazy_static;
use shared::types::interface::{SegmentsStatuses, StatusesArgs};
use shared::types::state::MissionControlId;
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

pub fn spawn_mission_controls_cron_jobs() {
    let cycles_cron_tabs: Vec<(MissionControlId, CronTab)> = get_cron_tabs()
        .into_iter()
        .filter(|(_, config)| config.cron_jobs.statuses.enabled)
        .collect();

    for (mission_control_id, cron_tab) in cycles_cron_tabs {
        spawn(collect_statuses(mission_control_id, cron_tab))
    }
}

async fn collect_statuses(mission_control_id: MissionControlId, cron_tab: CronTab) {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        let result = statuses(&mission_control_id, &cron_tab).await;

        set_statuses(&mission_control_id, &result);
    }
}

async fn statuses(
    mission_control_id: &MissionControlId,
    cron_tab: &CronTab,
) -> Result<SegmentsStatuses, String> {
    let args = StatusesArgs {
        cycles_threshold: cron_tab.cron_jobs.statuses.cycles_threshold,
    };

    let result: CallResult<(SegmentsStatuses,)> =
        call(*mission_control_id, "status", (args,)).await;

    match result {
        Err((_, message)) => Err(["Cannot get mission control statuses.", &message].join(" - ")),
        Ok((result,)) => Ok(result),
    }
}

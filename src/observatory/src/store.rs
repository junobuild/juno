use crate::types::state::{ArchiveStatuses, CronTab, CronTabs, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use shared::types::cronjob::CronJobs;
use shared::types::interface::{SegmentsStatuses, SetController};
use shared::types::state::{ControllerId, MissionControlId};

///
/// CronJobs
///

pub fn get_cron_tabs() -> CronTabs {
    STATE.with(|state| state.borrow().stable.cron_tabs.clone())
}

pub fn set_cron_jobs(mission_control_id: &MissionControlId, cron_jobs: &CronJobs) {
    STATE.with(|state| {
        set_cron_jobs_impl(
            mission_control_id,
            cron_jobs,
            &mut state.borrow_mut().stable,
        )
    })
}

fn set_cron_jobs_impl(
    mission_control_id: &MissionControlId,
    cron_jobs: &CronJobs,
    state: &mut StableState,
) {
    let current_notifications = state.cron_tabs.get(mission_control_id);

    let now = time();

    let created_at: u64 = match current_notifications {
        None => now,
        Some(current_notifications) => current_notifications.created_at,
    };

    let notifications = CronTab {
        cron_jobs: cron_jobs.clone(),
        created_at,
        updated_at: now,
    };

    state.cron_tabs.insert(*mission_control_id, notifications);
}

///
/// Controllers
///

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().stable.controllers,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(
            remove_controllers,
            &mut state.borrow_mut().stable.controllers,
        )
    })
}

pub fn set_cron_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().stable.cron_controllers,
        )
    })
}

pub fn delete_cron_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(
            remove_controllers,
            &mut state.borrow_mut().stable.cron_controllers,
        )
    })
}

///
/// Statuses
///

pub fn set_statuses(
    mission_control_id: &MissionControlId,
    statuses: &Result<SegmentsStatuses, String>,
) {
    STATE.with(|state| {
        set_statuses_impl(mission_control_id, statuses, &mut state.borrow_mut().stable)
    })
}

fn set_statuses_impl(
    mission_control_id: &MissionControlId,
    statuses: &Result<SegmentsStatuses, String>,
    state: &mut StableState,
) {
    let archive = state.archive.statuses.get(mission_control_id);

    match archive {
        None => {
            state.archive.statuses.insert(
                *mission_control_id,
                ArchiveStatuses::from([(time(), statuses.clone())]),
            );
        }
        Some(archive) => {
            let mut updated_archive = archive.clone();
            updated_archive.insert(time(), statuses.clone());
            state
                .archive
                .statuses
                .insert(*mission_control_id, updated_archive);
        }
    }
}

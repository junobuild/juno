use crate::types::interface::SetCronTab;
use crate::types::list::ListLastStatuses;
use crate::types::state::{ArchiveStatuses, CronTab, CronTabs, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use shared::types::interface::{SegmentsStatuses, SetController};
use shared::types::state::{ControllerId, UserId};

///
/// CronJobs
///

pub fn get_cron_tabs() -> CronTabs {
    STATE.with(|state| state.borrow().stable.cron_tabs.clone())
}

pub fn get_cron_tab(user: &UserId) -> Option<CronTab> {
    STATE.with(|state| get_cron_tab_impl(user, &state.borrow_mut().stable.cron_tabs))
}

fn get_cron_tab_impl(user: &UserId, state: &CronTabs) -> Option<CronTab> {
    let cron_tab = state.get(user);
    cron_tab.cloned()
}

pub fn set_cron_tab(user: &UserId, cron_tab: &SetCronTab) -> Result<(), String> {
    STATE.with(|state| set_cron_tab_impl(user, cron_tab, &mut state.borrow_mut().stable))
}

fn set_cron_tab_impl(
    user: &UserId,
    cron_tab: &SetCronTab,
    state: &mut StableState,
) -> Result<(), String> {
    let current_tab = state.cron_tabs.get(user);

    // Validate timestamp
    match current_tab {
        None => (),
        Some(current_tab) => match assert_timestamp(cron_tab.updated_at, current_tab.updated_at) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    let now = time();

    let created_at: u64 = match current_tab {
        None => now,
        Some(current_tab) => current_tab.created_at,
    };

    let updated_at: u64 = now;

    let new_cron_tab = CronTab {
        mission_control_id: cron_tab.mission_control_id,
        cron_jobs: cron_tab.cron_jobs.clone(),
        created_at,
        updated_at,
    };

    state.cron_tabs.insert(*user, new_cron_tab);

    Ok(())
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

pub fn set_statuses(user: &UserId, statuses: &Result<SegmentsStatuses, String>) {
    STATE.with(|state| set_statuses_impl(user, statuses, &mut state.borrow_mut().stable))
}

fn set_statuses_impl(
    user: &UserId,
    statuses: &Result<SegmentsStatuses, String>,
    state: &mut StableState,
) {
    let archive = state.archive.statuses.get(user);

    match archive {
        None => {
            state
                .archive
                .statuses
                .insert(*user, ArchiveStatuses::from([(time(), statuses.clone())]));
        }
        Some(archive) => {
            let mut updated_archive = archive.clone();
            updated_archive.insert(time(), statuses.clone());
            state.archive.statuses.insert(*user, updated_archive);
        }
    }
}

pub fn list_last_statuses() -> Vec<ListLastStatuses> {
    STATE.with(|state| list_last_statuses_impl(&state.borrow_mut().stable))
}

fn list_last_statuses_impl(state: &StableState) -> Vec<ListLastStatuses> {
    fn archive_statuses(user: &UserId, statuses: &ArchiveStatuses) -> Option<ListLastStatuses> {
        let last = statuses.iter().next_back();

        last.map(|(timestamp, statuses)| ListLastStatuses {
            user: *user,
            timestamp: *timestamp,
            statuses: statuses.clone(),
        })
    }

    state
        .archive
        .statuses
        .clone()
        .into_iter()
        .filter_map(|(user, statuses)| archive_statuses(&user, &statuses))
        .collect()
}

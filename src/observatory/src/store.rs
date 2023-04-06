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
use shared::types::state::{ControllerId, MissionControlId};

///
/// CronJobs
///

pub fn get_cron_tabs() -> CronTabs {
    STATE.with(|state| state.borrow().stable.cron_tabs.clone())
}

pub fn get_cron_tab(mission_control_id: &MissionControlId) -> Option<CronTab> {
    STATE.with(|state| get_cron_tab_impl(mission_control_id, &state.borrow_mut().stable.cron_tabs))
}

fn get_cron_tab_impl(mission_control_id: &MissionControlId, state: &CronTabs) -> Option<CronTab> {
    let cron_tab = state.get(mission_control_id);
    cron_tab.cloned()
}

pub fn set_cron_tab(cron_tab: &SetCronTab) -> Result<(), String> {
    STATE.with(|state| set_cron_tab_impl(cron_tab, &mut state.borrow_mut().stable))
}

fn set_cron_tab_impl(cron_tab: &SetCronTab, state: &mut StableState) -> Result<(), String> {
    let current_tab = state.cron_tabs.get(&cron_tab.mission_control_id);

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
        cron_jobs: cron_tab.cron_jobs.clone(),
        created_at,
        updated_at,
    };

    state
        .cron_tabs
        .insert(cron_tab.mission_control_id, new_cron_tab);

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

pub fn list_last_statuses() -> Vec<ListLastStatuses> {
    STATE.with(|state| list_last_statuses_impl(&state.borrow_mut().stable))
}

fn list_last_statuses_impl(state: &StableState) -> Vec<ListLastStatuses> {
    fn archive_statuses(
        mission_control_id: &MissionControlId,
        statuses: &ArchiveStatuses,
    ) -> Option<ListLastStatuses> {
        let last = statuses.iter().next_back();

        last.map(|(timestamp, statuses)| ListLastStatuses {
            mission_control_id: *mission_control_id,
            timestamp: *timestamp,
            statuses: statuses.clone(),
        })
    }

    state
        .archive
        .statuses
        .clone()
        .into_iter()
        .filter_map(|(mission_control_id, statuses)| {
            archive_statuses(&mission_control_id, &statuses)
        })
        .collect()
}

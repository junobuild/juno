use crate::constants::RETAIN_ARCHIVE_STATUSES_NS;
use crate::types::state::{StableState, Statuses, User};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::{Metadata, SatelliteId, SegmentStatusResult, UserId};
use std::collections::BTreeMap;

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().stable.user.user).unwrap()
}

pub fn set_metadata(metadata: &Metadata) {
    STATE.with(|state| set_metadata_impl(metadata, &mut state.borrow_mut().stable))
}

fn set_metadata_impl(metadata: &Metadata, state: &mut StableState) {
    let now = time();

    let updated_user = User {
        user: state.user.user,
        metadata: metadata.clone(),
        created_at: state.user.created_at,
        updated_at: now,
    };

    state.user = updated_user;
}

///
/// Statuses
///

pub fn set_mission_control_status(status: &SegmentStatusResult) {
    STATE.with(|state| set_mission_control_status_impl(status, &mut state.borrow_mut().stable))
}

fn set_mission_control_status_impl(status: &SegmentStatusResult, state: &mut StableState) {
    let now = time();
    let retain_timestamp = now - RETAIN_ARCHIVE_STATUSES_NS;

    state
        .archive
        .statuses
        .mission_control
        .retain(|timestamp, _| *timestamp <= retain_timestamp);

    state
        .archive
        .statuses
        .mission_control
        .insert(now, status.clone());
}

pub fn list_mission_control_statuses() -> Statuses {
    STATE.with(|state| {
        state
            .borrow()
            .stable
            .archive
            .statuses
            .mission_control
            .clone()
    })
}

pub fn set_satellite_status(satellite_id: &SatelliteId, status: &SegmentStatusResult) {
    STATE.with(|state| {
        set_satellite_status_impl(satellite_id, status, &mut state.borrow_mut().stable)
    })
}

fn set_satellite_status_impl(
    satellite_id: &SatelliteId,
    status: &SegmentStatusResult,
    state: &mut StableState,
) {
    let archive = state.archive.statuses.satellites.get(satellite_id);

    match archive {
        None => {
            state
                .archive
                .statuses
                .satellites
                .insert(*satellite_id, BTreeMap::from([(time(), status.clone())]));
        }
        Some(archive) => {
            let now = time();
            let retain_timestamp = now - RETAIN_ARCHIVE_STATUSES_NS;

            let mut updated_archive = archive.clone();

            updated_archive.retain(|timestamp, _| *timestamp <= retain_timestamp);
            updated_archive.insert(now, status.clone());

            state
                .archive
                .statuses
                .satellites
                .insert(*satellite_id, updated_archive);
        }
    }
}

pub fn list_satellite_statuses(satellite_id: &SatelliteId) -> Option<Statuses> {
    STATE.with(|state| list_satellite_statuses_impl(satellite_id, &state.borrow().stable))
}

fn list_satellite_statuses_impl(
    satellite_id: &SatelliteId,
    state: &StableState,
) -> Option<Statuses> {
    state.archive.statuses.satellites.get(satellite_id).cloned()
}

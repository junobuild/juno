use crate::types::state::{MissionControl, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::{MissionControlId, UserId};

/// Mission control centers

pub fn add_mission_control(
    mission_control_id: &MissionControlId,
    owner: &UserId,
) -> MissionControl {
    STATE.with(|state| {
        add_mission_control_impl(mission_control_id, owner, &mut state.borrow_mut().stable)
    })
}

fn add_mission_control_impl(
    mission_control_id: &MissionControlId,
    owner: &UserId,
    state: &mut StableState,
) -> MissionControl {
    let now = time();

    let new_mission_control = MissionControl {
        mission_control_id: *mission_control_id,
        owner: *owner,
        created_at: now,
        updated_at: now,
    };

    state
        .mission_controls
        .insert(*mission_control_id, new_mission_control.clone());

    new_mission_control
}

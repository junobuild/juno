use crate::types::state::{MissionControl, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::{MissionControlId, UserId};
use shared::utils::principal_not_equal;

/// Mission control centers

pub fn set_mission_control(
    mission_control_id: &MissionControlId,
    owner: &UserId,
) -> Result<MissionControl, &'static str> {
    STATE.with(|state| {
        set_mission_control_impl(mission_control_id, owner, &mut state.borrow_mut().stable)
    })
}

fn set_mission_control_impl(
    mission_control_id: &MissionControlId,
    owner: &UserId,
    state: &mut StableState,
) -> Result<MissionControl, &'static str> {
    let current_mission_control = state.mission_controls.get(mission_control_id);

    match current_mission_control {
        None => (),
        Some(current_mission_control) => {
            if principal_not_equal(current_mission_control.owner, *owner) {
                return Err("Owner does not match existing owner.");
            }
        }
    }

    let now = time();

    let created_at: u64 = match current_mission_control {
        None => now,
        Some(current_mission_control) => current_mission_control.created_at,
    };

    let new_mission_control = MissionControl {
        mission_control_id: *mission_control_id,
        owner: *owner,
        created_at,
        updated_at: now,
    };

    state
        .mission_controls
        .insert(*mission_control_id, new_mission_control.clone());

    Ok(new_mission_control)
}

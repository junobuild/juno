use crate::types::state::{Notifications, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::notifications::NotificationsConfig;
use shared::types::state::{MissionControlId, UserId};
use shared::utils::principal_not_equal;

pub fn set_notifications(
    mission_control_id: &MissionControlId,
    owner: &UserId,
    config: &NotificationsConfig,
) -> Result<Notifications, &'static str> {
    STATE.with(|state| {
        set_notifications_impl(mission_control_id, owner, config, &mut state.borrow_mut().stable)
    })
}

fn set_notifications_impl(
    mission_control_id: &MissionControlId,
    owner: &UserId,
    config: &NotificationsConfig,
    state: &mut StableState,
) -> Result<Notifications, &'static str> {
    let current_notifications = state.notifications.get(mission_control_id);

    match current_notifications {
        None => (),
        Some(current_notifications) => {
            if principal_not_equal(current_notifications.owner, *owner) {
                return Err("Owner does not match existing owner.");
            }
        }
    }

    let now = time();

    let created_at: u64 = match current_notifications {
        None => now,
        Some(current_notifications) => current_notifications.created_at,
    };

    let notifications = Notifications {
        mission_control_id: *mission_control_id,
        owner: *owner,
        config: config.clone(),
        created_at,
        updated_at: now,
    };

    state
        .notifications
        .insert(*mission_control_id, notifications.clone());

    Ok(notifications)
}

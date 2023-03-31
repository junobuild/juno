use crate::types::state::{Notifications, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::notifications::NotificationsConfig;
use shared::types::state::MissionControlId;

pub fn set_notifications(mission_control_id: &MissionControlId, config: &NotificationsConfig) {
    STATE.with(|state| {
        set_notifications_impl(mission_control_id, config, &mut state.borrow_mut().stable)
    })
}

fn set_notifications_impl(
    mission_control_id: &MissionControlId,
    config: &NotificationsConfig,
    state: &mut StableState,
) {
    let current_notifications = state.notifications.get(mission_control_id);

    let now = time();

    let created_at: u64 = match current_notifications {
        None => now,
        Some(current_notifications) => current_notifications.created_at,
    };

    let notifications = Notifications {
        mission_control_id: *mission_control_id,
        config: config.clone(),
        created_at,
        updated_at: now,
    };

    state
        .notifications
        .insert(*mission_control_id, notifications);
}

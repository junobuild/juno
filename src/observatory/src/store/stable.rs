use crate::memory::STATE;
use crate::random::random;
use crate::types::state::{Notification, NotificationKey, NotificationsStable};
use ic_cdk::api::time;
use junobuild_shared::types::state::SegmentId;

pub fn insert_notification(
    segment_id: &SegmentId,
    notification: &Notification,
) -> Result<(), String> {
    STATE.with(|state| {
        insert_notification_impl(
            segment_id,
            notification,
            &mut state.borrow_mut().stable.notifications,
        )
    })
}

fn insert_notification_impl(
    segment_id: &SegmentId,
    notification: &Notification,
    notifications: &mut NotificationsStable,
) -> Result<(), String> {
    let key = stable_notification_key(segment_id)?;

    notifications.insert(key, notification.clone());

    Ok(())
}

fn stable_notification_key(segment_id: &SegmentId) -> Result<NotificationKey, String> {
    let nonce = random()?;

    let key = NotificationKey {
        segment_id: *segment_id,
        created_at: time(),
        nonce,
    };

    Ok(key)
}

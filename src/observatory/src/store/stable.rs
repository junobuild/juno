use crate::memory::STATE;
use crate::types::state::{Notification, NotificationKey, NotificationsStable};
use ic_cdk::api::time;
use junobuild_shared::types::state::SegmentId;

pub fn insert_notification(segment_id: &SegmentId, notification: &Notification) {
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
) {
    notifications.insert(stable_notification_key(segment_id), notification.clone());
}

fn stable_notification_key(segment_id: &SegmentId) -> NotificationKey {
    NotificationKey {
        segment_id: *segment_id,
        created_at: time(),
    }
}

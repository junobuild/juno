use ic_cdk::api::time;
use junobuild_shared::types::state::SegmentId;
use crate::memory::STATE;
use crate::types::interface::NotificationArgs;
use crate::types::state::{DepositedCyclesEmailNotification, Notification, NotificationKey, NotificationsStable};

pub fn insert_notification(notification: &NotificationArgs) {
    STATE.with(|state| {
        insert_notification_impl(
            notification,
            &mut state.borrow_mut().stable.notifications,
        )
    })
}

fn insert_notification_impl(
    NotificationArgs {
        segment_id,
        to,
        metadata
    }: &NotificationArgs,
    notifications: &mut NotificationsStable,
) {
    let notification: Notification = Notification::DepositedCyclesEmail(DepositedCyclesEmailNotification {
        to: to.clone(),
        metadata: metadata.clone(),
    });

    notifications.insert(stable_notification_key(segment_id), notification);
}

fn stable_notification_key(segment_id: &SegmentId) -> NotificationKey {
    NotificationKey {
        segment_id: *segment_id,
        created_at: time(),
    }
}
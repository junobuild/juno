use crate::random::random;
use crate::store::filter::filter_notifications_range;
use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::types::interface::GetNotifications;
use crate::types::state::{Notification, NotificationKey, NotificationsStable};
use ic_cdk::api::time;
use junobuild_shared::structures::collect_stable_vec;
use junobuild_shared::types::state::SegmentId;

pub fn insert_notification(
    segment_id: &SegmentId,
    notification: &Notification,
) -> Result<NotificationKey, String> {
    mutate_stable_state(|stable| {
        insert_notification_impl(segment_id, notification, &mut stable.notifications)
    })
}

pub fn get_notification(key: &NotificationKey) -> Option<Notification> {
    read_stable_state(|stable| get_notification_impl(key, &stable.notifications))
}

pub fn set_notification(key: &NotificationKey, notification: &Notification) {
    mutate_stable_state(|stable| {
        insert_notification_with_key(key, notification, &mut stable.notifications)
    })
}

pub fn get_notifications(filter: &GetNotifications) -> Vec<(NotificationKey, Notification)> {
    read_stable_state(|stable| get_notifications_impl(filter, &stable.notifications))
}

fn get_notification_impl(
    key: &NotificationKey,
    notifications: &NotificationsStable,
) -> Option<Notification> {
    notifications.get(key)
}

fn insert_notification_impl(
    segment_id: &SegmentId,
    notification: &Notification,
    notifications: &mut NotificationsStable,
) -> Result<NotificationKey, String> {
    let key = stable_notification_key(segment_id)?;

    insert_notification_with_key(&key, notification, notifications);

    Ok(key)
}

fn insert_notification_with_key(
    key: &NotificationKey,
    notification: &Notification,
    notifications: &mut NotificationsStable,
) {
    notifications.insert(key.clone(), notification.clone());
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

fn get_notifications_impl(
    filter: &GetNotifications,
    history: &NotificationsStable,
) -> Vec<(NotificationKey, Notification)> {
    collect_stable_vec(history.range(filter_notifications_range(filter)))
}

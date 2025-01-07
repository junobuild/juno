use crate::types::interface::GetNotifications;
use crate::types::state::NotificationKey;
use candid::Principal;
use std::ops::RangeBounds;

pub const PRINCIPAL_MIN: Principal = Principal::from_slice(&[]);
pub const PRINCIPAL_MAX: Principal = Principal::from_slice(&[255; 29]);

pub fn filter_notifications_range(
    GetNotifications {
        segment_id,
        from,
        to,
    }: &GetNotifications,
) -> impl RangeBounds<NotificationKey> {
    let start_key = NotificationKey {
        segment_id: segment_id.unwrap_or(PRINCIPAL_MIN),
        created_at: from.unwrap_or(u64::MIN),
        nonce: i32::MIN,
    };

    let end_key = NotificationKey {
        segment_id: segment_id.unwrap_or(PRINCIPAL_MAX),
        created_at: to.unwrap_or(u64::MAX),
        nonce: i32::MAX,
    };

    start_key..end_key
}

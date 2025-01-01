use std::time::Duration;
use ic_cdk::{spawn, trap};
use ic_cdk_timers::set_timer;
use crate::http::send::send_notification;
use crate::store::stable::insert_notification;
use crate::types::interface::NotifyArgs;
use crate::types::state::Notification;

pub fn store_and_defer_notification(notify_args: &NotifyArgs) {
    let key = insert_notification(
        &notify_args.segment_id,
        &Notification::from_send(&notify_args.notification),
    )
        .unwrap_or_else(|e| trap(&e));

    set_timer(Duration::ZERO, || spawn(send_notification(key)));
}
use crate::http::send::send_notification;
use crate::store::stable::insert_notification;
use crate::types::state::Notification;
use ic_cdk::futures::spawn;
use ic_cdk::trap;
use ic_cdk_timers::set_timer;
use junobuild_shared::types::interface::NotifyArgs;
use std::time::Duration;

pub fn store_and_defer_notification(notify_args: &NotifyArgs) {
    let key = insert_notification(
        &notify_args.segment.id,
        &Notification::from_args(notify_args),
    )
    .unwrap_or_else(|e| trap(&e));

    set_timer(Duration::ZERO, || spawn(send_notification(key)));
}

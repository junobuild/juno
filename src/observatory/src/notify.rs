use crate::http::send::send_notification;
use crate::store::stable::insert_notification;
use crate::types::state::Notification;
use ic_cdk::futures::spawn_017_compat;
use ic_cdk_timers::set_timer;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::NotifyArgs;
use std::time::Duration;

pub fn store_and_defer_notification(notify_args: &NotifyArgs) {
    let key = insert_notification(
        &notify_args.segment.id,
        &Notification::from_args(notify_args),
    )
    .unwrap_or_trap();

    set_timer(Duration::ZERO, || spawn_017_compat(send_notification(key)));
}

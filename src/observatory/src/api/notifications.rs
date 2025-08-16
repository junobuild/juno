use crate::console::assert_mission_control_center;
use crate::guards::{caller_is_admin_controller, caller_is_not_anonymous};
use crate::notify::store_and_defer_notification;
use crate::store::stable::get_notifications;
use crate::types::interface::{GetNotifications, NotifyStatus};
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::caller;
use junobuild_shared::types::interface::NotifyArgs;

#[update(guard = "caller_is_not_anonymous")]
async fn notify(notify_args: NotifyArgs) {
    let mission_control_id = caller();

    assert_mission_control_center(&notify_args.user, &mission_control_id)
        .await
        .unwrap_or_else(|e| trap(&e));

    store_and_defer_notification(&notify_args);
}

#[query(guard = "caller_is_admin_controller")]
fn get_notify_status(filter: GetNotifications) -> NotifyStatus {
    let notifications = get_notifications(&filter);

    NotifyStatus::from_notifications(&notifications)
}

#[update(guard = "caller_is_admin_controller")]
fn ping(notify_args: NotifyArgs) {
    store_and_defer_notification(&notify_args);
}

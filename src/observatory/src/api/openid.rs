use crate::guards::caller_is_admin_controller;
use crate::openid::scheduler::{start_openid_scheduler, stop_openid_scheduler};
use ic_cdk_macros::update;

#[update(guard = "caller_is_admin_controller")]
fn start_openid_monitoring() {
    start_openid_scheduler()
}

#[update(guard = "caller_is_admin_controller")]
fn stop_openid_monitoring() {
    stop_openid_scheduler()
}

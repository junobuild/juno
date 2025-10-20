use crate::guards::caller_is_admin_controller;
use crate::openid::scheduler::{start_openid_scheduler, stop_openid_scheduler};
use ic_cdk_macros::update;
use junobuild_shared::ic::UnwrapOrTrap;

#[update(guard = "caller_is_admin_controller")]
fn start_openid_monitoring() {
    start_openid_scheduler().unwrap_or_trap()
}

#[update(guard = "caller_is_admin_controller")]
fn stop_openid_monitoring() {
    stop_openid_scheduler().unwrap_or_trap()
}

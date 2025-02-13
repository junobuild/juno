use std::time::Duration;
use ic_cdk::trap;
use ic_cdk_timers::set_timer;
use junobuild_shared::types::state::UserId;
use crate::user::usage::store::delete_user_usage;

pub fn invoke_delete_user_usage(user_id: &UserId) {
    let user_id = user_id.clone();

    set_timer(Duration::ZERO, move || {
        delete_user_usage(&user_id).unwrap_or_else(|e| trap(&e))
    });
}
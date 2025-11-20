use crate::user::usage::store::delete_user_usage;
use ic_cdk_timers::set_timer;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::state::UserId;
use std::time::Duration;

pub fn invoke_delete_user_usage(user_id: &UserId) {
    let user_id = *user_id;

    set_timer(Duration::ZERO, move || {
        delete_user_usage(&user_id).unwrap_or_trap()
    });
}

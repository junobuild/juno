use crate::guards::caller_is_admin_controller;
use crate::store::heap::set_env as set_env_store;
use crate::types::state::Env;
use ic_cdk_macros::update;

#[update(guard = "caller_is_admin_controller")]
fn set_env(env: Env) {
    set_env_store(&env);
}

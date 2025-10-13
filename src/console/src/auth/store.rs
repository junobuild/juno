use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::heap::{get_salt as get_state_salt, insert_salt};
use junobuild_auth::types::state::Salt;

pub fn set_salt(salt: &Salt) {
    insert_salt(&AuthHeap, salt);
}

pub fn get_salt() -> Option<Salt> {
    get_state_salt(&AuthHeap)
}

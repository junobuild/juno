use crate::get_controllers;
use crate::usage::store::get_user_usage as get_user_usage_store;
use crate::usage::types::state::UserUsage;
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::{Controllers, UserId};

pub fn get_user_usage_by_id(
    collection: &CollectionKey,
    user_id: &UserId,
    caller: Principal,
) -> Option<UserUsage> {
    let controllers: Controllers = get_controllers();

    if assert_caller(caller, user_id) || is_controller(caller, &controllers) {
        return get_user_usage_store(user_id, collection);
    }

    None
}

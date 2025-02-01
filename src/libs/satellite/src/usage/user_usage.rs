use crate::get_controllers;
use crate::usage::store;
use crate::usage::store::get_user_usage as get_user_usage_store;
use crate::usage::types::interface::ModificationType;
use crate::usage::types::state::UserUsage;
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::{Controllers, UserId};
use junobuild_shared::utils::principal_not_anonymous_and_equal;

pub fn get_user_usage_by_id(
    collection: &CollectionKey,
    user_id: &UserId,
    caller: Principal,
) -> Option<UserUsage> {
    let controllers: Controllers = get_controllers();

    if principal_not_anonymous_and_equal(*user_id, caller)
        || is_controller(caller, &controllers)
    {
        return get_user_usage_store(user_id, collection);
    }

    None
}

pub fn increase_user_usage(user_id: &UserId, collection: &CollectionKey) {
    store::update_user_usage(user_id, collection, &ModificationType::Set, None);
}

pub fn decrease_user_usage(user_id: &UserId, collection: &CollectionKey) {
    store::update_user_usage(user_id, collection, &ModificationType::Delete, None);
}

pub fn decrease_user_usage_by(user_id: &UserId, collection: &CollectionKey, count: u32) {
    store::update_user_usage(user_id, collection, &ModificationType::Delete, Some(count));
}

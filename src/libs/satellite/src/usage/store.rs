use crate::get_controllers;
use crate::types::state::CollectionType;
use crate::usage::state::{get_user_usage, set_user_usage};
use crate::usage::types::state::UserUsage;
use crate::usage::utils::{is_db_collection_no_usage, is_storage_collection_no_usage};
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::{Controllers, UserId};
use junobuild_shared::utils::principal_not_anonymous_and_equal;

pub fn get_db_usage_by_id(
    caller: Principal,
    collection: &CollectionKey,
    user_id: &UserId,
) -> Option<UserUsage> {
    get_user_usage_by_id(caller, collection, &CollectionType::Db, user_id)
}

pub fn get_storage_usage_by_id(
    caller: Principal,
    collection: &CollectionKey,
    user_id: &UserId,
) -> Option<UserUsage> {
    get_user_usage_by_id(caller, collection, &CollectionType::Storage, user_id)
}

fn get_user_usage_by_id(
    caller: Principal,
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
) -> Option<UserUsage> {
    let controllers: Controllers = get_controllers();

    if principal_not_anonymous_and_equal(*user_id, caller) || is_controller(caller, &controllers) {
        return get_user_usage(collection_key, collection_type, user_id);
    }

    None
}

pub fn set_db_usage(
    collection: &CollectionKey,
    user_id: &UserId,
    count: u32,
) -> Result<UserUsage, String> {
    if is_db_collection_no_usage(collection) {
        return Err(format!(
            "Datastore usage is not recorded for collection {}.",
            collection
        ));
    }

    let usage = set_user_usage(collection, &CollectionType::Db, user_id, count);

    Ok(usage)
}

pub fn set_storage_usage(
    collection: &CollectionKey,
    user_id: &UserId,
    count: u32,
) -> Result<UserUsage, String> {
    if is_storage_collection_no_usage(collection) {
        return Err(format!(
            "Storage usage is not recorded for collection {}.",
            collection
        ));
    }

    let usage = set_user_usage(collection, &CollectionType::Storage, user_id, count);

    Ok(usage)
}

use crate::get_controllers;
use crate::types::state::CollectionType;
use crate::usage::store::{get_user_usage as get_user_usage_store, update_user_usage};
use crate::usage::types::interface::ModificationType;
use crate::usage::types::state::UserUsage;
use candid::Principal;
use junobuild_collections::constants::{
    ASSETS_COLLECTIONS_NO_USER_USAGE, DB_COLLECTIONS_NO_USER_USAGE,
};
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
        return get_user_usage_store(collection_key, collection_type, user_id);
    }

    None
}

pub fn increase_db_usage(collection: &CollectionKey, user_id: &UserId) {
    if is_db_collection_no_usage(collection) {
        return;
    }

    update_user_usage(
        collection,
        &CollectionType::Db,
        user_id,
        &ModificationType::Set,
        None,
    );
}

pub fn decrease_db_usage(collection: &CollectionKey, user_id: &UserId) {
    if is_db_collection_no_usage(collection) {
        return;
    }

    update_user_usage(
        collection,
        &CollectionType::Db,
        user_id,
        &ModificationType::Delete,
        None,
    );
}

pub fn decrease_db_usage_by(collection: &CollectionKey, user_id: &UserId, count: u32) {
    if is_db_collection_no_usage(collection) {
        return;
    }

    update_user_usage(
        collection,
        &CollectionType::Db,
        user_id,
        &ModificationType::Delete,
        Some(count),
    );
}

pub fn increase_storage_usage(collection: &CollectionKey, user_id: &UserId) {
    if is_storage_collection_no_usage(collection) {
        return;
    }

    update_user_usage(
        collection,
        &CollectionType::Storage,
        user_id,
        &ModificationType::Set,
        None,
    );
}

pub fn decrease_storage_usage(collection: &CollectionKey, user_id: &UserId) {
    if is_storage_collection_no_usage(collection) {
        return;
    }

    update_user_usage(
        collection,
        &CollectionType::Storage,
        user_id,
        &ModificationType::Delete,
        None,
    );
}

pub fn decrease_storage_usage_by(collection: &CollectionKey, user_id: &UserId, count: u32) {
    if is_storage_collection_no_usage(collection) {
        return;
    }

    update_user_usage(
        collection,
        &CollectionType::Storage,
        user_id,
        &ModificationType::Delete,
        Some(count),
    );
}

fn is_db_collection_no_usage(collection: &CollectionKey) -> bool {
    DB_COLLECTIONS_NO_USER_USAGE.contains(&collection.as_str())
}

fn is_storage_collection_no_usage(collection: &CollectionKey) -> bool {
    ASSETS_COLLECTIONS_NO_USER_USAGE.contains(&collection.as_str())
}

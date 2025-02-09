use crate::usage::store::increment_usage;
use crate::usage::utils::{is_db_collection_no_usage, is_storage_collection_no_usage};
use junobuild_collections::constants::{
    USER_USAGE_DB_COLLECTION_KEY, USER_USAGE_STORAGE_COLLECTION_KEY,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::{Controllers, UserId};

pub fn increment_and_assert_db_usage(
    caller: UserId,
    controllers: &Controllers,
    collection: &CollectionKey,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    if is_db_collection_no_usage(collection) {
        return Ok(());
    }

    increment_and_assert_usage(
        caller,
        controllers,
        collection,
        &USER_USAGE_DB_COLLECTION_KEY.to_string(),
        max_changes_per_user,
    )
}

pub fn increment_and_assert_storage_usage(
    caller: UserId,
    controllers: &Controllers,
    collection: &CollectionKey,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    if is_storage_collection_no_usage(collection) {
        return Ok(());
    }

    increment_and_assert_usage(
        caller,
        controllers,
        collection,
        &USER_USAGE_STORAGE_COLLECTION_KEY.to_string(),
        max_changes_per_user,
    )
}

fn increment_and_assert_usage(
    caller: UserId,
    controllers: &Controllers,
    collection: &CollectionKey,
    user_usage_collection: &CollectionKey,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    // We only collect usage for users
    if is_controller(caller, controllers) {
        return Ok(());
    }

    let user_usage = increment_usage(user_usage_collection, collection, &caller)?;

    if let Some(max_changes_per_user) = max_changes_per_user {
        if user_usage.changes_count > max_changes_per_user {
            return Err("Change limit reached.".to_string());
        }
    }

    Ok(())
}

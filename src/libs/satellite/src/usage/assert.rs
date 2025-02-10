use crate::types::state::CollectionType;
use crate::usage::store::increment_usage;
use crate::usage::types::state::UserUsageData;
use crate::usage::utils::{is_db_collection_no_usage, is_storage_collection_no_usage};
use crate::SetDoc;
use junobuild_collections::constants::db::{COLLECTION_USER_KEY, COLLECTION_USER_USAGE_KEY};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::{Controllers, UserId};
use junobuild_utils::decode_doc_data;
// ---------------------------------------------------------
// Increment user usage - i.e. when a user edit, create or delete
// ---------------------------------------------------------

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
        &CollectionType::Db,
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
        &CollectionType::Storage,
        max_changes_per_user,
    )
}

fn increment_and_assert_usage(
    caller: UserId,
    controllers: &Controllers,
    collection: &CollectionKey,
    collection_type: &CollectionType,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    // We only collect usage for users
    if is_controller(caller, controllers) {
        return Ok(());
    }

    let user_usage = increment_usage(collection, collection_type, &caller)?;

    if let Some(max_changes_per_user) = max_changes_per_user {
        if user_usage.changes_count > max_changes_per_user {
            return Err("Change limit reached.".to_string());
        }
    }

    Ok(())
}

// ---------------------------------------------------------
// Assert struct - useful when an admit set imperatively a user usage
// ---------------------------------------------------------

pub fn assert_user_usage_collection_data(
    collection: &CollectionKey,
    doc: &SetDoc,
) -> Result<(), String> {
    let user_usage_collection = COLLECTION_USER_USAGE_KEY;

    if collection != user_usage_collection {
        return Ok(());
    }

    decode_doc_data::<UserUsageData>(&doc.data)
        .map_err(|err| format!("Invalid user usage data: {}", err))?;

    Ok(())
}

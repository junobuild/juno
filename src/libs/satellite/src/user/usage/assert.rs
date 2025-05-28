use crate::errors::user::{
    JUNO_DATASTORE_ERROR_USER_USAGE_CHANGE_LIMIT_REACHED,
    JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA,
};
use crate::types::state::CollectionType;
use crate::user::usage::store::increment_usage;
use crate::user::usage::types::state::UserUsageData;
use crate::SetDoc;
use junobuild_collections::assert::collection::is_system_collection;
use junobuild_collections::constants::db::COLLECTION_USER_USAGE_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_write_controller;
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
    // We do not collect usage on system collection. This is useful for performance reason (collection #dapp) or because others are solely editable by controllers.
    if is_system_collection(collection) {
        return Ok(());
    }

    // We only collect usage for users
    if is_write_controller(caller, controllers) {
        return Ok(());
    }

    let user_usage = increment_usage(collection, collection_type, &caller)?;

    if let Some(max_changes_per_user) = max_changes_per_user {
        if user_usage.changes_count > max_changes_per_user {
            return Err(JUNO_DATASTORE_ERROR_USER_USAGE_CHANGE_LIMIT_REACHED.to_string());
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
        .map_err(|err| format!("{}: {}", JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA, err))?;

    Ok(())
}

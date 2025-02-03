use crate::types::state::CollectionType;
use crate::usage::state::{set_user_usage, update_user_usage};
use crate::usage::types::state::UserUsage;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
use crate::usage::utils::is_storage_collection_no_usage;

pub fn increase_storage_usage(collection: &CollectionKey, user_id: &UserId) {
    if is_storage_collection_no_usage(collection) {
        return;
    }

    update_user_usage(collection, &CollectionType::Storage, user_id, None);
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

pub fn decrease_storage_usage(collection: &CollectionKey, user_id: &UserId) {
    if is_storage_collection_no_usage(collection) {
        return;
    }

    update_user_usage(collection, &CollectionType::Storage, user_id, None);
}

pub fn decrease_storage_usage_by(collection: &CollectionKey, user_id: &UserId, count: u32) {
    if is_storage_collection_no_usage(collection) {
        return;
    }

    update_user_usage(collection, &CollectionType::Storage, user_id, Some(count));
}

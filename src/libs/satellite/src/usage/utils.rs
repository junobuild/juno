use crate::usage::types::state::UserUsageKey;
use junobuild_collections::constants::{
    ASSETS_COLLECTIONS_NO_USER_USAGE, DB_COLLECTIONS_NO_USER_USAGE,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;

pub fn is_db_collection_no_usage(collection: &CollectionKey) -> bool {
    DB_COLLECTIONS_NO_USER_USAGE.contains(&collection.as_str())
}

pub fn is_storage_collection_no_usage(collection: &CollectionKey) -> bool {
    ASSETS_COLLECTIONS_NO_USER_USAGE.contains(&collection.as_str())
}

pub fn build_user_usage_key(user_id: &UserId, collection_key: &CollectionKey) -> UserUsageKey {
    format!("{}#{}", user_id.to_text(), collection_key)
}

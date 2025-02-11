use junobuild_collections::constants::assets::ASSETS_COLLECTIONS_WITHOUT_USER_USAGE;
use junobuild_collections::constants::db::DB_COLLECTIONS_WITHOUT_USER_USAGE;
use junobuild_collections::types::core::CollectionKey;

pub fn is_db_collection_no_usage(collection: &CollectionKey) -> bool {
    DB_COLLECTIONS_WITHOUT_USER_USAGE.contains(&collection.as_str())
}

pub fn is_storage_collection_no_usage(collection: &CollectionKey) -> bool {
    ASSETS_COLLECTIONS_WITHOUT_USER_USAGE.contains(&collection.as_str())
}

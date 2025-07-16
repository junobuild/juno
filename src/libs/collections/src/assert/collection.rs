use crate::constants::core::SYS_COLLECTION_PREFIX;
use crate::types::core::CollectionKey;

pub fn is_system_collection(collection: &CollectionKey) -> bool {
    collection.starts_with(SYS_COLLECTION_PREFIX)
}

pub fn is_not_system_collection(collection: &CollectionKey) -> bool {
    !is_system_collection(collection)
}

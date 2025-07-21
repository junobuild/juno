use crate::errors::{
    JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY, JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_FOUND,
};
use crate::types::core::CollectionKey;

pub fn msg_db_collection_not_empty(collection: &CollectionKey) -> String {
    msg_collection_not_empty(collection, &"Datastore".to_string())
}

pub fn msg_storage_collection_not_empty(collection: &CollectionKey) -> String {
    msg_collection_not_empty(collection, &"Storage".to_string())
}

fn msg_collection_not_empty(collection: &CollectionKey, name: &String) -> String {
    format!(
        r#"{JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} ({name} - {collection})"#,
    )
}

pub fn msg_db_collection_not_found(collection: &CollectionKey) -> String {
    msg_collection_not_found(collection, &"Datastore".to_string())
}

pub fn msg_storage_collection_not_found(collection: &CollectionKey) -> String {
    msg_collection_not_found(collection, &"Storage".to_string())
}

fn msg_collection_not_found(collection: &CollectionKey, name: &String) -> String {
    format!(
        r#"{JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_FOUND} ({name} - {collection})"#
    )
}

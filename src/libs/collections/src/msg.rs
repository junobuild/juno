use crate::types::core::CollectionKey;

pub const COLLECTION_NOT_EMPTY: &str = "Collection not empty: ";

pub fn msg_db_collection_not_empty(collection: &CollectionKey) -> String {
    msg_collection_not_empty(collection, &"Datastore".to_string())
}

pub fn msg_storage_collection_not_empty(collection: &CollectionKey) -> String {
    msg_collection_not_empty(collection, &"Storage".to_string())
}

fn msg_collection_not_empty(collection: &CollectionKey, name: &String) -> String {
    format!(
        r#"The "{}" collection in {} is not empty."#,
        collection, name
    )
}

pub fn msg_db_collection_not_found(collection: &CollectionKey) -> String {
    msg_collection_not_found(collection, &"Datastore".to_string())
}

pub fn msg_storage_collection_not_found(collection: &CollectionKey) -> String {
    msg_collection_not_found(collection, &"Storage".to_string())
}

fn msg_collection_not_found(collection: &CollectionKey, name: &String) -> String {
    format!(r#"Collection "{}" not found in {}."#, collection, name)
}

use crate::types::core::CollectionKey;

pub fn range_collection_end(collection: &CollectionKey) -> CollectionKey {
    // Source: https://github.com/frederikrothenberger
    // 0u8 shall be use until char::MIN get standardized
    let mut end_collection: String = collection.clone();
    end_collection.push(char::from(0u8));

    end_collection
}
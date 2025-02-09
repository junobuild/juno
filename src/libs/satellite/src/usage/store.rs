use crate::usage::types::state::UserUsage;
use crate::usage::utils::build_user_usage_key;
use crate::{get_doc_store, set_doc_store, SetDoc};
use ic_cdk::id;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
use junobuild_utils::{decode_doc_data, encode_doc_data};

pub fn increment_usage(
    user_usage_collection: &CollectionKey,
    collection: &CollectionKey,
    user_id: &UserId,
) -> Result<UserUsage, String> {
    let key = build_user_usage_key(user_id, collection);

    let doc = get_doc_store(id(), user_usage_collection.to_string(), key.clone())?;

    let current_usage: Option<UserUsage> = match &doc {
        None => None,
        Some(doc) => decode_doc_data(&doc.data)?,
    };

    let update_usage = UserUsage::increment(&current_usage);

    let update_doc: SetDoc = SetDoc {
        data: encode_doc_data(&update_usage)?,
        description: match &doc {
            None => None,
            Some(doc) => doc.description.clone(),
        },
        version: match &doc {
            None => None,
            Some(doc) => doc.version.clone(),
        },
    };

    set_doc_store(id(), user_usage_collection.to_string(), key, update_doc)?;

    Ok(update_usage)
}

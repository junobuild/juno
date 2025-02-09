use crate::usage::types::state::{UserUsage, UserUsageKey};
use crate::{get_doc_store, set_doc_store, SetDoc};
use ic_cdk::id;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
use junobuild_utils::{decode_doc_data, encode_doc_data};
use junobuild_collections::constants::USER_USAGE_COLLECTION_KEY;
use crate::types::state::CollectionType;

pub fn increment_usage(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
) -> Result<UserUsage, String> {
    let user_usage_key = UserUsageKey::create(user_id, collection_key, collection_type);
    let key = user_usage_key.to_key();

    let doc = get_doc_store(id(), USER_USAGE_COLLECTION_KEY.to_string(), key.clone())?;

    let current_usage = doc.as_ref().map(|doc| decode_doc_data(&doc.data)).transpose()?;

    let update_usage = UserUsage::increment(&current_usage);

    let update_doc = SetDoc {
        data: encode_doc_data(&update_usage)?,
        description: doc.as_ref().and_then(|d| d.description.clone()),
        version: doc.as_ref().and_then(|d| d.version.clone()),
    };

    set_doc_store(id(), USER_USAGE_COLLECTION_KEY.to_string(), key, update_doc)?;

    Ok(update_usage)
}

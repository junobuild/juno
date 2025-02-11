use crate::db::internal::{unsafe_get_doc, unsafe_set_doc};
use crate::rules::store::get_rule_db;
use crate::types::state::CollectionType;
use crate::usage::types::state::{UserUsage, UserUsageKey};
use crate::SetDoc;
use ic_cdk::id;
use junobuild_collections::constants::db::COLLECTION_USER_USAGE_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
use junobuild_utils::{decode_doc_data, encode_doc_data};

pub fn increment_usage(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
) -> Result<UserUsage, String> {
    let user_usage_key = UserUsageKey::create(user_id, collection_key, collection_type).to_key();

    let user_usage_collection = COLLECTION_USER_USAGE_KEY.to_string();

    let rule = get_rule_db(&user_usage_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_usage_collection))?;

    let doc = unsafe_get_doc(&user_usage_collection.to_string(), &user_usage_key, &rule)?;

    let current_usage = doc
        .as_ref()
        .map(|doc| decode_doc_data(&doc.data))
        .transpose()?;

    let update_usage = UserUsage::increment(&current_usage);

    let update_doc = SetDoc {
        data: encode_doc_data(&update_usage)?,
        description: doc.as_ref().and_then(|d| d.description.clone()),
        version: doc.as_ref().and_then(|d| d.version),
    };

    unsafe_set_doc(
        id(),
        &user_usage_collection.to_string(),
        &user_usage_key,
        update_doc,
        &rule,
    )?;

    Ok(update_usage)
}

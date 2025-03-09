use crate::db::internal::{unsafe_delete_doc, unsafe_get_doc, unsafe_set_doc};
use crate::rules::store::{get_rule_db, get_rules_db, get_rules_storage};
use crate::types::state::CollectionType;
use crate::user::usage::types::state::{UserUsageData, UserUsageKey};
use crate::SetDoc;
use ic_cdk::id;
use junobuild_collections::constants::db::COLLECTION_USER_USAGE_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::state::UserId;
use junobuild_utils::{decode_doc_data, encode_doc_data};

pub fn increment_usage(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
) -> Result<UserUsageData, String> {
    let user_usage_key = UserUsageKey::create(user_id, collection_key, collection_type).to_key();

    let user_usage_collection = COLLECTION_USER_USAGE_KEY.to_string();

    let rule = get_rule_db(&user_usage_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_usage_collection))?;

    let doc = unsafe_get_doc(&user_usage_collection.to_string(), &user_usage_key, &rule)?;

    let current_usage = doc
        .as_ref()
        .map(|doc| decode_doc_data(&doc.data))
        .transpose()?;

    let update_usage = UserUsageData::increment(&current_usage);

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

pub fn delete_user_usage(user_id: &UserId) -> Result<(), String> {
    let user_usage_collection = COLLECTION_USER_USAGE_KEY.to_string();

    let rule = get_rule_db(&user_usage_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_usage_collection))?;

    delete_user_usage_for_collections(user_id, &CollectionType::Db, &user_usage_collection, &rule)?;
    delete_user_usage_for_collections(
        user_id,
        &CollectionType::Storage,
        &user_usage_collection,
        &rule,
    )?;

    Ok(())
}

fn delete_user_usage_for_collections(
    user_id: &UserId,
    collection_type: &CollectionType,
    user_usage_collection: &CollectionKey,
    user_usage_rule: &Rule,
) -> Result<(), String> {
    let rules = match collection_type {
        CollectionType::Db => get_rules_db(),
        CollectionType::Storage => get_rules_storage(),
    };

    for (collection_key, _) in rules {
        let user_usage_key =
            UserUsageKey::create(user_id, &collection_key, collection_type).to_key();

        unsafe_delete_doc(user_usage_collection, &user_usage_key, user_usage_rule)?;
    }

    Ok(())
}

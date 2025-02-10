use crate::db::internal::{get_doc_internal, set_doc_internal};
use crate::db::types::config::DbConfig;
use crate::db::types::interface::SetDoc;
use crate::db::types::state::Doc;
use crate::rules::store::get_rule_db;
use crate::types::state::CollectionType;
use crate::types::store::StoreContext;
use crate::usage::types::state::{UserUsage, UserUsageKey};
use ic_cdk::id;
use junobuild_collections::constants::db::COLLECTION_USER_USAGE_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_utils::{decode_doc_data, encode_doc_data};

pub fn increment_usage(
    context: &StoreContext,
    config: &Option<DbConfig>,
    collection_type: &CollectionType,
) -> Result<UserUsage, String> {
    let user_usage_collection = COLLECTION_USER_USAGE_KEY.to_string();
    let user_usage_key =
        UserUsageKey::create(&context.caller, context.collection, collection_type).to_key();

    let user_usage_context = StoreContext {
        caller: id(),
        controllers: context.controllers,
        collection: &user_usage_collection,
    };

    let rule = get_rule_db(&user_usage_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_usage_collection))?;

    let current_doc: Option<Doc> = get_doc_internal(&user_usage_context, &user_usage_key, &rule)?;

    let current_usage = current_doc
        .as_ref()
        .map(|doc| decode_doc_data(&doc.data))
        .transpose()?;

    let update_usage = UserUsage::increment(&current_usage);

    let update_doc = SetDoc {
        data: encode_doc_data(&update_usage)?,
        description: current_doc.as_ref().and_then(|d| d.description.clone()),
        version: current_doc.as_ref().and_then(|d| d.version),
    };

    set_doc_internal(
        &user_usage_context,
        config,
        &user_usage_key,
        &rule,
        &current_doc,
        update_doc,
    )?;

    Ok(update_usage)
}

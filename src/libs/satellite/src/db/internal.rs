use crate::db::assert::assert_set_doc;
use crate::db::msg::ERROR_CANNOT_READ;
use crate::db::state::{get_doc as get_state_doc, insert_doc as insert_state_doc};
use crate::db::types::config::DbConfig;
use crate::db::types::interface::SetDoc;
use crate::db::types::state::{Doc, DocUpsert};
use crate::types::store::StoreContext;
use junobuild_collections::assert::stores::assert_permission;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::Key;

/// Retrieves a document from the state.
///
/// ⚠️ **Warning:** This function is for internal use only.
///
pub fn get_doc_internal(
    context: &StoreContext,
    key: &Key,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    let doc = get_state_doc(context.collection, key, rule)?;

    if let Some(ref value) = doc {
        if !assert_permission(&rule.read, value.owner, context.caller, context.controllers) {
            return Err(ERROR_CANNOT_READ.to_string());
        }
    }

    Ok(doc)
}

/// Inserts or updates a document in the state.
///
/// ⚠️ **Warning:** This function is for internal use only.
///
pub fn set_doc_internal(
    context: &StoreContext,
    config: &Option<DbConfig>,
    key: &Key,
    rule: &Rule,
    current_doc: &Option<Doc>,
    value: SetDoc,
) -> Result<DocUpsert, String> {
    let doc: Doc = Doc::prepare(context.caller, current_doc, value.clone());

    assert_set_doc(context, config, &key, &value, rule, &current_doc)?;
    // No assertion and incrementation of usage here. This is an internal feature.

    let (_evicted_doc, after) = insert_state_doc(context.collection, key, &doc, rule)?;

    Ok(DocUpsert {
        before: current_doc.clone(),
        after,
    })
}

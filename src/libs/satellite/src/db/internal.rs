use crate::db::state::{get_doc as get_state_doc, insert_doc as insert_state_doc, delete_doc as delete_state_doc};
use crate::db::types::state::{Doc, DocUpsert};
use crate::SetDoc;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::Key;
use junobuild_shared::types::state::UserId;

/// Retrieves a document directly from the state.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_get_doc(
    collection: &CollectionKey,
    key: &Key,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    get_state_doc(collection, key, rule)
}

/// Inserts or updates a document directly in the state.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_set_doc(
    caller: UserId,
    collection: &CollectionKey,
    key: &Key,
    value: SetDoc,
    rule: &Rule,
) -> Result<DocUpsert, String> {
    let current_doc = get_state_doc(collection, key, rule)?;

    let doc: Doc = Doc::prepare(caller, &current_doc, value);

    let (_evicted_doc, after) = insert_state_doc(collection, key, &doc, rule)?;

    Ok(DocUpsert {
        before: current_doc,
        after,
    })
}

/// Delete a document directly from the state.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_delete_doc(
    collection: &CollectionKey,
    key: &Key,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    delete_state_doc(collection, key, rule)
}
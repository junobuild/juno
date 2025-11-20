use crate::db::internal::{unsafe_delete_doc, unsafe_get_doc, unsafe_set_doc};
use crate::rules::store::get_rule_db;
use crate::user::webauthn::types::state::{UserWebAuthnCredentialId, UserWebAuthnIndex};
use junobuild_collections::constants::db::{
    COLLECTION_USER_WEBAUTHN_INDEX_KEY, COLLECTION_USER_WEBAUTHN_KEY,
};
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_shared::ic::api::id;
use junobuild_shared::types::state::UserId;

pub fn set_user_webauthn_index(
    user_id: &UserId,
    credential_id: &UserWebAuthnCredentialId,
) -> Result<(), String> {
    let user_webauthn_index_collection = COLLECTION_USER_WEBAUTHN_INDEX_KEY.to_string();

    let rule = get_rule_db(&user_webauthn_index_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_webauthn_index_collection))?;

    let user_webauthn_index_key = user_id.to_text();

    // user_webauthn entry cannot be updated (see assert_user_webauthn_write_permission) but for future prone
    // we read the current index to increment its version.
    let doc = unsafe_get_doc(
        &user_webauthn_index_collection.to_string(),
        &user_webauthn_index_key,
        &rule,
    )?;

    let update_doc = UserWebAuthnIndex::prepare_set_doc(credential_id, &doc);

    unsafe_set_doc(
        id(),
        &user_webauthn_index_collection.to_string(),
        &user_webauthn_index_key,
        update_doc,
        &rule,
    )?;

    Ok(())
}

pub fn delete_user_webauthn_and_index(user_id: &UserId) -> Result<(), String> {
    let credential_id = delete_user_webauthn_index(user_id)?;

    if let Some(credential_id) = credential_id {
        delete_user_webauthn(&credential_id)?;
    }

    Ok(())
}

fn delete_user_webauthn_index(
    user_id: &UserId,
) -> Result<Option<UserWebAuthnCredentialId>, String> {
    let user_webauthn_index_collection = COLLECTION_USER_WEBAUTHN_INDEX_KEY.to_string();

    let index_rule = get_rule_db(&user_webauthn_index_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_webauthn_index_collection))?;

    let deleted_index_doc = unsafe_delete_doc(
        &user_webauthn_index_collection,
        &user_id.to_text(),
        &index_rule,
    )?;

    let credential_id = deleted_index_doc.and_then(|doc| doc.description);

    Ok(credential_id)
}

fn delete_user_webauthn(credential_id: &UserWebAuthnCredentialId) -> Result<(), String> {
    let user_webauthn_collection = COLLECTION_USER_WEBAUTHN_KEY.to_string();

    let user_webauthn_rule = get_rule_db(&user_webauthn_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_webauthn_collection))?;

    unsafe_delete_doc(
        &user_webauthn_collection,
        credential_id,
        &user_webauthn_rule,
    )?;

    Ok(())
}

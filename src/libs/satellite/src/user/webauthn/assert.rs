use crate::errors::user::{JUNO_DATASTORE_ERROR_USER_CALLER_WEBAUTHN_KEY, JUNO_DATASTORE_ERROR_USER_INVALID_WEBAUTHN_DATA, JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CANNOT_UPDATE};
use crate::user::webauthn::types::state::UserWebAuthnData;
use crate::{Doc, SetDoc};
use candid::Principal;
use junobuild_collections::constants::db::COLLECTION_USER_WEBAUTHN_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::utils::principal_not_equal;
use junobuild_utils::decode_doc_data;

pub fn assert_user_webauthn_data(
    caller: Principal,
    collection: &CollectionKey,
    doc: &SetDoc,
) -> Result<(), String> {
    let user_webauthn_collection = COLLECTION_USER_WEBAUTHN_KEY;

    if collection != user_webauthn_collection {
        return Ok(());
    }

    let data = decode_doc_data::<UserWebAuthnData>(&doc.data)
        .map_err(|err| format!("{JUNO_DATASTORE_ERROR_USER_INVALID_WEBAUTHN_DATA}: {err}"))?;

    let public_key = Principal::self_authenticating(&data.public_key.value);

    if principal_not_equal(caller, public_key) {
        return Err(JUNO_DATASTORE_ERROR_USER_CALLER_WEBAUTHN_KEY.to_string());
    }

    Ok(())
}

pub fn assert_user_webauthn_write_permission(
    collection: &CollectionKey,
    current_doc: &Option<Doc>,
) -> Result<(), String> {
    let user_webauthn_collection = COLLECTION_USER_WEBAUTHN_KEY;

    if collection != user_webauthn_collection {
        return Ok(());
    }

    // It's a new document
    if current_doc.is_none() {
        return Ok(());
    }

    // The user webauthn entry already exist
    Err(JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CANNOT_UPDATE.to_string())
}

use crate::errors::user::{JUNO_DATASTORE_ERROR_USER_ADMIN_INVALID_DATA, JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED};
use crate::{get_doc_store, SetDoc};
use crate::user::admin::types::state::{BannedReason, UserAdminData, UserAdminKey};
use candid::Principal;
use ic_cdk::id;
use junobuild_collections::constants::db::{COLLECTION_USER_ADMIN_KEY};
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::Controllers;
use junobuild_utils::decode_doc_data;
use junobuild_collections::types::core::CollectionKey;

pub fn assert_user_is_not_banned(
    caller: Principal,
    controllers: &Controllers,
) -> Result<(), String> {
    // This way we spare loading the user for controllers calls.
    if is_controller(caller, controllers) {
        return Ok(());
    }

    let user_admin_key = UserAdminKey::create(&caller).to_key();

    let user = get_doc_store(id(), COLLECTION_USER_ADMIN_KEY.to_string(), user_admin_key)?;

    if let Some(user) = user {
        let user_data = decode_doc_data::<UserAdminData>(&user.data)?;

        if let Some(BannedReason::Indefinite) = user_data.banned {
            return Err(JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED.to_string());
        }
    }

    Ok(())
}

pub fn assert_user_admin_collection_data(collection: &CollectionKey, doc: &SetDoc) -> Result<(), String> {
    if collection != COLLECTION_USER_ADMIN_KEY {
        return Ok(());
    }

    decode_doc_data::<UserAdminData>(&doc.data)
        .map_err(|err| format!("{}: {}", JUNO_DATASTORE_ERROR_USER_ADMIN_INVALID_DATA, err))?;

    Ok(())
}
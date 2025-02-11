use crate::user::types::state::UserData;
use crate::{get_doc_store, Doc, SetDoc};
use candid::Principal;
use ic_cdk::id;
use junobuild_collections::constants::db::COLLECTION_USER_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::core::Key;
use junobuild_shared::utils::principal_not_equal;
use junobuild_utils::decode_doc_data;
use junobuild_shared::controllers::{is_admin_controller};
use junobuild_shared::types::state::Controllers;

pub fn is_known_user(caller: Principal) -> bool {
    let user_key = caller.to_text();

    let user = get_doc_store(id(), COLLECTION_USER_KEY.to_string(), user_key).unwrap_or(None);

    user.is_some()
}

pub fn assert_user_collection_caller_key(
    caller: Principal,
    collection: &CollectionKey,
    key: &Key,
    current_doc: &Option<Doc>,
) -> Result<(), String> {
    if collection != COLLECTION_USER_KEY {
        return Ok(());
    }

    let owner = Principal::from_text(key.trim())
        .map_err(|_| "User key must be a textual representation of a principal.".to_string())?;

    // Once set the owner cannot be modified and another assertion prevent user update unless the caller is an admin controller
    if current_doc.is_none() && principal_not_equal(owner, caller) {
        return Err("Caller and key must match to create a user.".to_string());
    }

    Ok(())
}

pub fn assert_user_collection_data(collection: &CollectionKey, doc: &SetDoc) -> Result<(), String> {
    let user_collection = COLLECTION_USER_KEY;

    if collection != user_collection {
        return Ok(());
    }

    decode_doc_data::<UserData>(&doc.data).map_err(|err| format!("Invalid user data: {}", err))?;

    Ok(())
}

pub fn assert_user_write_permission(caller: Principal, controllers: &Controllers, collection: &CollectionKey, current_doc: &Option<Doc>,) -> Result<(), String> {
    let user_collection = COLLECTION_USER_KEY;

    if collection != user_collection {
        return Ok(());
    }

    if is_admin_controller(caller, controllers) {
        return Ok(());
    }

    // It's a new document
    if current_doc.is_none() {
        return Ok(());
    }

    // The user already exist but the caller is not a controller
    Err("Cannot update user.".to_string())
}

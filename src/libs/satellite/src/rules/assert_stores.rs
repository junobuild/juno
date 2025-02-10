use crate::get_doc_store;
use candid::Principal;
use ic_cdk::id;
use junobuild_collections::constants::{COLLECTION_USER_KEY, DEFAULT_DB_COLLECTIONS};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::core::Key;
use junobuild_shared::utils::principal_not_equal;

pub fn is_known_user(caller: Principal) -> bool {
    let user_key = caller.to_text();

    let user = get_doc_store(id(), COLLECTION_USER_KEY.to_string(), user_key).unwrap_or(None);

    user.is_some()
}

pub fn assert_user_collection_caller_key(
    caller: Principal,
    collection: &CollectionKey,
    key: &Key,
) -> Result<(), String> {
    if collection != COLLECTION_USER_KEY {
        return Ok(());
    }

    let owner = Principal::from_text(key.trim())
        .map_err(|_| "User key must be a textual representation of a principal.".to_string())?;

    if principal_not_equal(owner, caller) {
        return Err("Caller and key must match to create a user.".to_string());
    }

    Ok(())
}

use crate::db::internal::unsafe_get_doc;
use crate::user::types::state::UserData;
use crate::SetDoc;
use candid::Principal;
use junobuild_collections::constants::db::COLLECTION_USER_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::Key;
use junobuild_shared::utils::principal_not_equal;
use junobuild_utils::decode_doc_data;

pub fn is_known_user(caller: Principal, rule: &Rule) -> bool {
    let user_key = caller.to_text();

    let user = unsafe_get_doc(&COLLECTION_USER_KEY.to_string(), &user_key, rule).unwrap_or(None);

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

pub fn assert_user_collection_data(collection: &CollectionKey, doc: &SetDoc) -> Result<(), String> {
    let user_collection = COLLECTION_USER_KEY;

    if collection != user_collection {
        return Ok(());
    }

    decode_doc_data::<UserData>(&doc.data).map_err(|err| format!("Invalid user data: {}", err))?;

    Ok(())
}

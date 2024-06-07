use crate::get_doc_store;
use candid::Principal;
use ic_cdk::id;
use junobuild_collections::constants::DEFAULT_DB_COLLECTIONS;

pub fn is_known_user(caller: Principal) -> bool {
    let user_collection = DEFAULT_DB_COLLECTIONS[0].0;
    let user_key = caller.to_text();

    let user = get_doc_store(id(), user_collection.to_string(), user_key).unwrap_or(None);

    user.is_some()
}

use crate::errors::automation::JUNO_DATASTORE_ERROR_AUTOMATION_CALLER;
use candid::Principal;
use junobuild_collections::constants::db::COLLECTION_AUTOMATION_TOKEN_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::ic::api::id;
use junobuild_shared::utils::principal_not_equal;

pub fn assert_automation_token_caller(
    caller: Principal,
    collection: &CollectionKey,
) -> Result<(), String> {
    if collection != COLLECTION_AUTOMATION_TOKEN_KEY {
        return Ok(());
    }

    if principal_not_equal(id(), caller) {
        return Err(JUNO_DATASTORE_ERROR_AUTOMATION_CALLER.to_string());
    }

    Ok(())
}

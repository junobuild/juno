use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::{Controllers, UserId};
use crate::usage::user_usage::{increase_db_usage, is_db_collection_no_usage};

pub fn increment_and_assert_db_usage(
    caller: UserId,
    controllers: &Controllers,
    collection: &CollectionKey,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    if is_db_collection_no_usage(collection) {
        return Ok(());
    }

    // We only collect usage for users
    if is_controller(caller, controllers) {
        return Ok(());
    }

    let user_usage = increase_db_usage(collection, &caller);

    if let Some(max_changes_per_user) = max_changes_per_user {
        if user_usage.changes_count > max_changes_per_user {
            return Err("Documents limit reached.".to_string());
        }
    }

    Ok(())
}
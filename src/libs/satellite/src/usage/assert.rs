use crate::db::store::get_config_store as get_db_config;
use crate::db::types::config::DbConfig;
use crate::types::state::CollectionType;
use crate::types::store::StoreContext;
use crate::usage::store::increment_usage;
use crate::usage::utils::{is_db_collection_no_usage, is_storage_collection_no_usage};
use junobuild_shared::controllers::is_controller;

pub fn increment_and_assert_db_usage(
    context: &StoreContext,
    config: &Option<DbConfig>,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    if is_db_collection_no_usage(context.collection) {
        return Ok(());
    }

    increment_and_assert_usage(context, config, &CollectionType::Db, max_changes_per_user)
}

pub fn increment_and_assert_storage_usage(
    context: &StoreContext,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    if is_storage_collection_no_usage(context.collection) {
        return Ok(());
    }

    let config = get_db_config();

    increment_and_assert_usage(
        context,
        &config,
        &CollectionType::Storage,
        max_changes_per_user,
    )
}

fn increment_and_assert_usage(
    context: &StoreContext,
    config: &Option<DbConfig>,
    collection_type: &CollectionType,
    max_changes_per_user: Option<u32>,
) -> Result<(), String> {
    // We only collect usage for users
    if is_controller(context.caller.clone(), context.controllers) {
        return Ok(());
    }

    let user_usage = increment_usage(context, config, collection_type)?;

    if let Some(max_changes_per_user) = max_changes_per_user {
        if user_usage.changes_count > max_changes_per_user {
            return Err("Change limit reached.".to_string());
        }
    }

    Ok(())
}

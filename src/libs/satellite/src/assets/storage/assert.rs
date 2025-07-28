use crate::auth::caller::assert_caller_is_allowed;
use crate::hooks::storage::invoke_assert_delete_asset;
use crate::types::store::{AssertContext, StoreContext};
use crate::user::core::assert::{assert_user_is_not_banned, is_known_user};
use crate::user::usage::assert::increment_and_assert_storage_usage;
use candid::Principal;
use junobuild_collections::assert::stores::{
    assert_permission, assert_permission_with, public_permission,
};
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Permission;
use junobuild_shared::assert::assert_version;
use junobuild_shared::controllers::{controller_can_write, is_controller};
use junobuild_shared::types::state::Controllers;
use junobuild_storage::errors::{
    JUNO_STORAGE_ERROR_ASSET_NOT_FOUND, JUNO_STORAGE_ERROR_CANNOT_READ_ASSET,
    JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED,
};
use junobuild_storage::runtime::increment_and_assert_rate as increment_and_assert_rate_runtime;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;
use junobuild_storage::types::store::Asset;

pub fn assert_get_asset(
    &StoreContext {
        caller,
        controllers,
        collection: _,
    }: &StoreContext,
    &AssertContext { rule, auth_config }: &AssertContext,
    current_asset: &Asset,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    assert_read_permission(caller, controllers, current_asset, &rule.read)?;

    Ok(())
}

pub fn assert_list_assets(
    &StoreContext {
        caller,
        controllers,
        collection: _,
    }: &StoreContext,
    &AssertContext {
        auth_config,
        rule: _,
    }: &AssertContext,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    Ok(())
}

pub fn assert_storage_list_permission(
    permission: &Permission,
    owner: Principal,
    caller: Principal,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> bool {
    // Special case. We need to allow controllers with the "Submit" scope to list #dapp assets — which are public anyway —
    // because when used with the CLI, it needs to know which assets are currently deployed in order to only submit those
    // that are different.
    if collection == COLLECTION_ASSET_KEY {
        return assert_permission_with(permission, owner, caller, controllers, is_controller);
    }

    assert_permission(permission, owner, caller, controllers)
}

pub fn assert_create_batch(
    caller: Principal,
    controllers: &Controllers,
    &AssertContext { rule, auth_config }: &AssertContext,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    if !(public_permission(&rule.write)
        || is_known_user(caller)
        || controller_can_write(caller, controllers))
    {
        return Err(JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED.to_string());
    }

    Ok(())
}

pub fn assert_delete_asset(
    context: &StoreContext,
    &AssertContext { rule, auth_config }: &AssertContext,
    asset: &Asset,
) -> Result<(), String> {
    assert_caller_is_allowed(context.caller, context.controllers, auth_config)?;
    assert_user_is_not_banned(context.caller, context.controllers)?;

    if !assert_permission(
        &rule.write,
        asset.key.owner,
        context.caller,
        context.controllers,
    ) {
        return Err(JUNO_STORAGE_ERROR_ASSET_NOT_FOUND.to_string());
    }

    increment_and_assert_storage_usage(
        context.caller,
        context.controllers,
        context.collection,
        rule.max_changes_per_user,
    )?;

    increment_and_assert_rate_runtime(context.collection, &rule.rate_config)?;

    invoke_assert_delete_asset(&context.caller, asset)?;

    Ok(())
}

fn assert_read_permission(
    caller: Principal,
    controllers: &Controllers,
    current_asset: &Asset,
    rule: &Permission,
) -> Result<(), String> {
    if !assert_permission(rule, current_asset.key.owner, caller, controllers) {
        return Err(JUNO_STORAGE_ERROR_CANNOT_READ_ASSET.to_string());
    }

    Ok(())
}

pub fn assert_set_config(
    proposed_config: &SetStorageConfig,
    current_config: &StorageConfig,
) -> Result<(), String> {
    assert_version(proposed_config.version, current_config.version)?;

    Ok(())
}

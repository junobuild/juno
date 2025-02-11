use crate::hooks::invoke_assert_delete_asset;
use crate::types::store::StoreContext;
use crate::usage::assert::increment_and_assert_storage_usage;
use crate::user::assert::{assert_user_is_not_banned, is_known_user};
use candid::Principal;
use junobuild_collections::assert::stores::{assert_permission, public_permission};
use junobuild_collections::types::rules::{Permission, Rule};
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::msg::{ERROR_ASSET_NOT_FOUND, ERROR_CANNOT_READ_ASSET, UPLOAD_NOT_ALLOWED};
use junobuild_storage::runtime::increment_and_assert_rate as increment_and_assert_rate_runtime;
use junobuild_storage::types::store::Asset;

pub fn assert_get_asset(
    &StoreContext {
        caller,
        controllers,
        collection: _,
    }: &StoreContext,
    rule: &Rule,
    current_asset: &Asset,
) -> Result<(), String> {
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
) -> Result<(), String> {
    assert_user_is_not_banned(caller, controllers)?;

    Ok(())
}

pub fn assert_create_batch(
    caller: Principal,
    controllers: &Controllers,
    rule: &Rule,
) -> Result<(), String> {
    assert_user_is_not_banned(caller, controllers)?;

    if !(public_permission(&rule.write)
        || is_known_user(caller)
        || is_controller(caller, controllers))
    {
        return Err(UPLOAD_NOT_ALLOWED.to_string());
    }

    Ok(())
}

pub fn assert_delete_asset(
    context: &StoreContext,
    rule: &Rule,
    asset: &Asset,
) -> Result<(), String> {
    assert_user_is_not_banned(context.caller, context.controllers)?;

    if !assert_permission(
        &rule.write,
        asset.key.owner,
        context.caller,
        context.controllers,
    ) {
        return Err(ERROR_ASSET_NOT_FOUND.to_string());
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
    if !assert_permission(&rule, current_asset.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_READ_ASSET.to_string());
    }

    Ok(())
}

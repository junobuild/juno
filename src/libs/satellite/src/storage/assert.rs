use crate::hooks::invoke_assert_delete_asset;
use crate::rules::assert_stores::is_known_user;
use crate::types::store::StoreContext;
use candid::Principal;
use junobuild_collections::assert_stores::{assert_permission, public_permission};
use junobuild_collections::types::rules::Rule;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::msg::{ERROR_ASSET_NOT_FOUND, UPLOAD_NOT_ALLOWED};
use junobuild_storage::runtime::{
    increment_and_assert_rate as increment_and_assert_rate_runtime,
};
use junobuild_storage::types::store::Asset;

pub fn assert_create_batch(
    caller: Principal,
    controllers: &Controllers,
    rule: &Rule,
) -> Result<(), String> {
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
    if !assert_permission(
        &rule.write,
        asset.key.owner,
        context.caller,
        context.controllers,
    ) {
        return Err(ERROR_ASSET_NOT_FOUND.to_string());
    }

    increment_and_assert_rate_runtime(context.collection, &rule.rate_config)?;

    invoke_assert_delete_asset(&context.caller, &asset)?;

    Ok(())
}

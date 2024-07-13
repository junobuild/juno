use crate::controllers::store::get_controllers;
use crate::storage::state::{get_asset, get_config, get_rule, insert_asset};
use ic_cdk::id;
use junobuild_collections::assert_stores::assert_permission;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::msg::SET_NOT_ALLOWED;
use junobuild_storage::runtime::update_certified_asset as update_runtime_certified_asset;
use junobuild_storage::types::store::{Asset, AssetKey};
use junobuild_storage::utils::create_asset_with_content;

pub fn set_asset_handler(
    key: &AssetKey,
    content: &String,
    headers: &[HeaderField],
) -> Result<(), String> {
    let rule = get_rule(&key.collection)?;

    let existing_asset = get_asset(&key.collection, &key.full_path, &rule);

    if let Some(ref existing_asset) = existing_asset {
        let controllers: Controllers = get_controllers();
        // The handler is used in Serverless Functions therefore the caller is itself.
        // This allows to assert for permission. Useful for collection set as "Private".
        let caller = id();

        if !assert_permission(&rule.write, existing_asset.key.owner, caller, &controllers) {
            return Err(SET_NOT_ALLOWED.to_string());
        }
    }

    set_asset_handler_impl(key, &existing_asset, content, headers, &rule)
}

fn set_asset_handler_impl(
    key: &AssetKey,
    existing_asset: &Option<Asset>,
    content: &String,
    headers: &[HeaderField],
    rule: &Rule,
) -> Result<(), String> {
    let asset = create_asset_with_content(content, headers, existing_asset.clone(), key.clone());

    insert_asset(&key.collection, &key.full_path, &asset, rule);

    let config = get_config();

    update_runtime_certified_asset(&asset, &config);

    Ok(())
}

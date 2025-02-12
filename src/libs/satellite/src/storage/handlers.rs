use crate::controllers::store::get_controllers;
use crate::storage::state::{get_asset, get_config, get_rule, insert_asset, insert_asset_encoding};
use ic_cdk::id;
use junobuild_collections::assert::stores::assert_permission;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::constants::ASSET_ENCODING_NO_COMPRESSION;
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::errors::SET_NOT_ALLOWED;
use junobuild_storage::runtime::update_certified_asset as update_runtime_certified_asset;
use junobuild_storage::types::store::{Asset, AssetKey};
use junobuild_storage::utils::map_content_encoding;

/// Handles the setting of an asset within the store. This function performs
/// various checks and operations to ensure the asset can be set and updated
/// correctly.
///
/// # Parameters
/// - `key`: A reference to the `AssetKey` representing the unique identifier
///   for the asset within the collection.
/// - `content`: A reference to the `String` containing the asset content to be
///   stored.
/// - `headers`: A slice of `HeaderField` representing any additional headers
///   associated with the asset.
///
/// # Returns
/// - `Result<(), String>`: Returns `Ok(())` if the asset is successfully set.
///   Returns an `Err(String)` with an error message if the operation fails.
///
/// # Errors
/// - Returns an error if the asset cannot be retrieved from the storage.
/// - Returns an error if the permission check fails when the asset is
///   identified as existing and private.
///
/// # Important Note
/// The content is set for the identity encoding, meaning there is no
/// compression applied.
pub fn set_asset_handler(
    key: &AssetKey,
    content: &Blob,
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
    content: &Blob,
    headers: &[HeaderField],
    rule: &Rule,
) -> Result<(), String> {
    let mut asset = Asset::prepare(key.clone(), headers.to_vec(), existing_asset);

    let encoding = map_content_encoding(content);

    insert_asset_encoding(
        &key.full_path,
        ASSET_ENCODING_NO_COMPRESSION,
        &encoding,
        &mut asset,
        rule,
    );

    insert_asset(&key.collection, &key.full_path, &asset, rule);

    let config = get_config();

    update_runtime_certified_asset(&asset, &config);

    Ok(())
}

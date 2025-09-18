use crate::assets::constants::CDN_JUNO_RELEASES_COLLECTION_KEY;
use crate::assets::storage::internal::unsafe_delete_asset;
use crate::assets::storage::store::assert_assets_collection_empty_store;
use crate::assets::storage::strategy_impls::StorageState;
use crate::auth::alternative_origins::update_alternative_origins;
use crate::auth::store::get_config as get_auth_config;
use crate::rules::internal::unsafe_set_rule;
use crate::rules::store::get_rule_storage;
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::msg::msg_storage_collection_not_found;
use junobuild_collections::types::rules::Rule;
use junobuild_storage::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use junobuild_storage::well_known::update::update_custom_domains_asset;

pub fn switch_storage_memory() -> Result<(), String> {
    let dapp_collection = COLLECTION_ASSET_KEY.to_string();
    let releases_collection = CDN_JUNO_RELEASES_COLLECTION_KEY.to_string();

    let Some(dapp_rule) = get_rule_storage(&dapp_collection) else {
        return Err(msg_storage_collection_not_found(&dapp_collection).to_string());
    };

    let Some(releases_rule) = get_rule_storage(&releases_collection) else {
        return Err(msg_storage_collection_not_found(&releases_collection).to_string());
    };

    let well_known_paths = [
        WELL_KNOWN_CUSTOM_DOMAINS.to_string(),
        WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string(),
    ];

    // For simplicity and performance reasons, we delete without previous assertion.
    // Any potential changes is rolled back if an error occurs later on in the function.
    for well_known_path in &well_known_paths {
        unsafe_delete_asset(&dapp_collection, well_known_path, &dapp_rule);
    }

    // We assert the collection is empty otherwise switching memory might lead
    // to issues and assets being not resolved.
    assert_assets_collection_empty_store(&dapp_collection)?;
    assert_assets_collection_empty_store(&releases_collection)?;

    // Toggle the memory heap <> stable
    let update_dapp_rule = Rule::switch_rule_memory(&dapp_rule);
    unsafe_set_rule(&dapp_collection, &update_dapp_rule);

    let update_releases_rule = Rule::switch_rule_memory(&releases_rule);
    unsafe_set_rule(&releases_collection, &update_releases_rule);

    // Redo .well-known/ic-domains but, on the new memory
    update_custom_domains_asset(&StorageState)?;

    // Redo .well-known/ii-alternative-origins but, on the new memory
    if let Some(auth_config) = get_auth_config() {
        update_alternative_origins(&auth_config)?;
    }

    Ok(())
}

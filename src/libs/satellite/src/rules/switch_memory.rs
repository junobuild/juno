use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::types::rules::Rule;
use junobuild_storage::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use junobuild_storage::well_known::update::update_custom_domains_asset;
use crate::assets::storage::internal::{unsafe_delete_asset};
use crate::assets::storage::store::assert_assets_collection_empty_store;
use crate::assets::storage::strategy_impls::StorageState;
use crate::rules::internal::unsafe_set_rule;
use crate::rules::store::get_rule_storage;

pub fn switch_storage_dapp_memory() -> Result<(), String> {
    let dapp_collection = COLLECTION_ASSET_KEY.to_string();

    let Some(rule) = get_rule_storage(&dapp_collection)  else {
        return Err("TODO".to_string());
    };

    let well_known_paths = [
        WELL_KNOWN_CUSTOM_DOMAINS.to_string(),
        WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string()
    ];

    // For simplicity and performance reasons, we delete without previous assertion.
    // Any potential changes is rollbacked if an error occurs later on in the function.
    for well_known_path in well_known_paths.iter() {
        unsafe_delete_asset(&dapp_collection, well_known_path, &rule);
    }

    assert_assets_collection_empty_store(&dapp_collection)?;

    let update_rule = Rule::switch_rule_memory(&rule);
    unsafe_set_rule(&dapp_collection, &update_rule);

    // TODO: update_alternative_origins_asset
    update_custom_domains_asset(&StorageState)?;

    Ok(())
}
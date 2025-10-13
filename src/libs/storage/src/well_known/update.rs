use crate::constants::{
    ASSET_ENCODING_NO_COMPRESSION, WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS,
};
use crate::runtime::{
    delete_certified_asset, update_certified_asset as update_runtime_certified_asset,
};
use crate::strategies::{StorageCertificateStrategy, StorageStateStrategy};
use crate::well_known::types::PrepareWellKnownAssetFn;
use crate::well_known::utils::{map_alternative_origins_asset, map_custom_domains_asset};
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_shared::types::core::DomainName;

pub fn update_alternative_origins_asset(
    alternative_origins: &str,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) -> Result<(), String> {
    let full_path = WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string();

    update_asset(
        &full_path,
        alternative_origins,
        storage_state,
        certificate,
        &map_alternative_origins_asset,
    )
}

pub fn update_custom_domains_asset(
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) -> Result<(), String> {
    let full_path = WELL_KNOWN_CUSTOM_DOMAINS.to_string();

    let custom_domains = storage_state.get_domains();

    if custom_domains.is_empty() {
        return delete_asset(&full_path, storage_state, certificate);
    }

    let concat_custom_domains = custom_domains
        .into_keys()
        .collect::<Vec<DomainName>>()
        .join("\n");

    update_asset(
        &full_path,
        &concat_custom_domains,
        storage_state,
        certificate,
        &map_custom_domains_asset,
    )
}

pub fn delete_alternative_origins_asset(
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) -> Result<(), String> {
    let full_path = WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string();

    delete_asset(&full_path, storage_state, certificate)
}

fn update_asset(
    full_path: &String,
    content: &str,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
    f: &PrepareWellKnownAssetFn,
) -> Result<(), String> {
    let collection = COLLECTION_ASSET_KEY.to_string();

    // #app collection rule
    let rule = storage_state.get_rule(&collection)?;

    let existing_asset = storage_state.get_asset(&collection, full_path, &rule);

    let (mut asset, encoding) = f(content, existing_asset);

    storage_state.insert_asset_encoding(
        full_path,
        ASSET_ENCODING_NO_COMPRESSION,
        &encoding,
        &mut asset,
        &rule,
    );

    storage_state.insert_asset(&collection, full_path, &asset, &rule);

    let config = storage_state.get_config();

    update_runtime_certified_asset(&asset, &config, certificate);

    Ok(())
}

fn delete_asset(
    full_path: &String,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) -> Result<(), String> {
    let collection = COLLECTION_ASSET_KEY.to_string();

    // #app collection rule
    let rule = storage_state.get_rule(&collection)?;

    let asset = storage_state.delete_asset(&collection, full_path, &rule);

    if let Some(asset) = asset {
        delete_certified_asset(&asset, certificate);
    }

    Ok(())
}

use crate::storage::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use crate::storage::runtime::{
    delete_certified_asset, update_certified_asset as update_runtime_certified_asset,
};
use crate::storage::state::{
    delete_asset as delete_state_asset, get_asset as get_state_asset, get_domains, get_rule,
    insert_asset as insert_state_asset,
};
use crate::storage::store::get_config_store;
use crate::storage::types::store::Asset;
use crate::storage::well_known::utils::{map_alternative_origins_asset, map_custom_domains_asset};
use crate::types::core::DomainName;
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;

pub fn update_alternative_origins_asset(alternative_origins: &String) -> Result<(), String> {
    let full_path = WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string();

    update_asset(
        &full_path,
        alternative_origins,
        &map_alternative_origins_asset,
    )
}

pub fn update_custom_domains_asset() -> Result<(), String> {
    let full_path = WELL_KNOWN_CUSTOM_DOMAINS.to_string();

    let custom_domains = get_domains();

    if custom_domains.is_empty() {
        return delete_asset(&full_path);
    }

    let concat_custom_domains = custom_domains
        .into_keys()
        .collect::<Vec<DomainName>>()
        .join("\n");

    update_asset(
        &full_path,
        &concat_custom_domains,
        &map_custom_domains_asset,
    )
}

pub fn delete_alternative_origins_asset() -> Result<(), String> {
    let full_path = WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string();

    delete_asset(&full_path)
}

fn update_asset(
    full_path: &String,
    content: &String,
    f: &dyn Fn(&String, Option<Asset>) -> Asset,
) -> Result<(), String> {
    let collection = DEFAULT_ASSETS_COLLECTIONS[0].0.to_string();

    // #app collection rule
    let rule = get_rule(&collection)?;

    let existing_asset = get_state_asset(&collection, full_path, &rule);

    let asset = f(content, existing_asset);

    insert_state_asset(&collection, full_path, &asset, &rule);

    let config = get_config_store();

    update_runtime_certified_asset(&asset, &config);

    Ok(())
}

fn delete_asset(full_path: &String) -> Result<(), String> {
    let collection = DEFAULT_ASSETS_COLLECTIONS[0].0.to_string();

    // #app collection rule
    let rule = get_rule(&collection)?;

    let asset = delete_state_asset(&collection, full_path, &rule);

    if let Some(asset) = asset {
        delete_certified_asset(&asset);
    }

    Ok(())
}

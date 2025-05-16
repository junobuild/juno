use crate::memory::STATE;
use crate::storage::certified_assets::runtime::init_certified_assets as init_runtime_certified_assets;
use crate::storage::state::heap::{
    collect_delete_assets, delete_asset, delete_domain, get_asset, get_config, get_domain,
    get_domains, insert_asset, insert_config, insert_domain,
};
use crate::store::heap::get_controllers;
use crate::store::stable::get_proposal;
use crate::strategies_impls::storage::StorageState;
use crate::types::state::ProposalId;
use candid::Principal;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::list::list_values;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_storage::heap_utils::collect_assets_heap;
use junobuild_storage::store::create_batch;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::{AssetNoContent, InitAssetKey};
use junobuild_storage::types::runtime_state::BatchId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding, EncodingType};
use junobuild_storage::utils::{get_token_protected_asset, map_asset_no_content};
use junobuild_storage::well_known::update::update_custom_domains_asset;
use junobuild_storage::well_known::utils::build_custom_domain;
use regex::Regex;

pub fn get_public_asset(full_path: FullPath, token: Option<String>) -> Option<(Asset, Memory)> {
    let asset = get_asset(&full_path);

    match asset {
        None => None,
        Some(asset) => match &asset.key.token {
            None => Some((asset.clone(), Memory::Heap)),
            Some(asset_token) => {
                let protected_asset = get_token_protected_asset(&asset, asset_token, token);
                protected_asset.map(|protected_asset| (protected_asset, Memory::Heap))
            }
        },
    }
}

pub fn insert_asset_encoding(
    full_path: &FullPath,
    encoding_type: &EncodingType,
    encoding: &AssetEncoding,
) -> Result<(), String> {
    let mut asset = match get_asset(full_path) {
        Some(asset) => asset,
        None => return Err(format!("No asset found for {}", full_path)),
    };

    asset
        .encodings
        .insert(encoding_type.to_owned(), encoding.clone());

    insert_asset(full_path, &asset);

    Ok(())
}

pub fn list_assets(
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    STATE.with(|state| {
        let state_ref = state.borrow();
        let assets = collect_assets_heap(collection, &state_ref.heap.storage.assets);
        Ok(list_assets_impl(&assets, filters))
    })
}

fn list_assets_impl(
    assets: &[(&FullPath, &Asset)],
    filters: &ListParams,
) -> ListResults<AssetNoContent> {
    let values = list_values(assets, filters);

    ListResults::<AssetNoContent> {
        items: values
            .items
            .into_iter()
            .map(|(_, asset)| map_asset_no_content(&asset))
            .collect(),
        items_length: values.items_length,
        items_page: values.items_page,
        matches_length: values.matches_length,
        matches_pages: values.matches_pages,
    }
}

pub fn delete_assets(collection: &CollectionKey) {
    let full_paths = collect_delete_assets(collection);

    for full_path in full_paths {
        delete_asset(&full_path);
    }
}

pub fn init_asset_upload(
    caller: Principal,
    init: InitAssetKey,
    proposal_id: ProposalId,
) -> Result<BatchId, String> {
    let proposal = get_proposal(&proposal_id);

    if proposal.is_none() {
        return Err(format!("No proposal found for {}", proposal_id));
    }

    assert_releases_keys(&init)?;

    let controllers = get_controllers();
    let config = get_config();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &StorageState,
    )
}

fn assert_releases_keys(InitAssetKey { full_path, .. }: &InitAssetKey) -> Result<(), String> {
    if full_path == "/releases/metadata.json" {
        return Err(format!("{} is a reserved asset.", full_path).to_string());
    }

    if full_path.starts_with("/releases/satellite")
        || full_path.starts_with("/releases/mission_control")
        || full_path.starts_with("/releases/orbiter")
    {
        let re =
            Regex::new(r"^/releases/(satellite|mission_control|orbiter)-v\d+\.\d+\.\d+\.wasm\.gz$")
                .unwrap();

        return if re.is_match(full_path) {
            Ok(())
        } else {
            Err(format!(
                "{} does not match the required pattern.",
                full_path
            ))
        };
    }

    Ok(())
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn set_config_store(config: &StorageConfig) {
    insert_config(config);

    init_runtime_certified_assets();
}

pub fn get_config_store() -> StorageConfig {
    get_config()
}

// ---------------------------------------------------------
// Domain
// ---------------------------------------------------------

// TODO: following functions are really similar to those of the satellite, maybe some day we can refactor those.

pub fn get_custom_domains_store() -> CustomDomains {
    get_domains()
}

pub fn set_domain_store(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_domain_impl(domain_name, bn_id)
}

pub fn delete_domain_store(domain_name: &DomainName) -> Result<(), String> {
    delete_domain_impl(domain_name)
}

fn delete_domain_impl(domain_name: &DomainName) -> Result<(), String> {
    delete_domain(domain_name);

    update_custom_domains_asset(&StorageState)
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_state_domain_impl(domain_name, bn_id);

    update_custom_domains_asset(&StorageState)
}

fn set_state_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) {
    let domain = get_domain(domain_name);

    let custom_domain = build_custom_domain(domain, bn_id);

    insert_domain(domain_name, &custom_domain);
}

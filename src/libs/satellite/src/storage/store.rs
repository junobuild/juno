use crate::controllers::store::get_controllers;
use crate::hooks::invoke_assert_delete_asset;
use crate::memory::STATE;
use candid::Principal;
use ic_cdk::api::time;
use junobuild_collections::assert_stores::{assert_permission, public_permission};
use junobuild_collections::msg::COLLECTION_NOT_EMPTY;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::list::list_values;
use junobuild_shared::types::state::{Controllers, Timestamp, Version};

use crate::rules::assert_stores::is_known_user;
use crate::storage::runtime::init_certified_assets as init_runtime_certified_assets;
use crate::storage::state::{
    count_assets_heap, count_assets_stable, delete_asset as delete_state_asset,
    delete_domain as delete_state_domain, get_asset as get_state_asset, get_assets_heap,
    get_assets_stable, get_config as get_state_config, get_config,
    get_content_chunks as get_state_content_chunks, get_domain as get_state_domain,
    get_domains as get_state_domains, get_public_asset as get_state_public_asset,
    get_rule as get_state_rule, insert_config as insert_state_config,
    insert_domain as insert_state_domain,
};
use crate::storage::strategy_impls::{StorageAssertions, StorageState, StorageUpload};
use junobuild_shared::types::core::{Blob, CollectionKey, DomainName};
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_storage::constants::{
    ROOT_404_HTML, ROOT_INDEX_HTML, WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS,
};
use junobuild_storage::msg::{ERROR_ASSET_NOT_FOUND, UPLOAD_NOT_ALLOWED};
use junobuild_storage::runtime::{
    delete_certified_asset as delete_runtime_certified_asset,
    update_certified_asset as update_runtime_certified_asset,
};
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_batch, create_chunk};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::types::interface::{AssetNoContent, CommitBatch, InitAssetKey, UploadChunk};
use junobuild_storage::types::state::{BatchId, ChunkId, FullPath};
use junobuild_storage::types::store::{Asset, AssetEncoding};
use junobuild_storage::utils::{filter_collection_values, filter_values, map_asset_no_content};
use junobuild_storage::well_known::update::update_custom_domains_asset;

///
/// Getter, list and delete
///

/// Get content chunks of an asset.
///
/// This function retrieves content chunks of an asset based on the specified parameters.
/// It returns an `Option<Blob>` representing the content chunks, or `None` if no chunks are found.
///
/// # Parameters
/// - `encoding`: A reference to the `AssetEncoding` indicating the encoding of the asset.
/// - `chunk_index`: The index of the content chunk to retrieve.
/// - `memory`: A reference to the `Memory` type (Heap or Stable).
///
/// # Returns
/// - `Some(Blob)`: Content chunks of the asset.
/// - `None`: No content chunks found.
///
/// This function allows you to retrieve content chunks of an asset stored in a Juno collection's store.
pub fn get_content_chunks_store(
    encoding: &AssetEncoding,
    chunk_index: usize,
    memory: &Memory,
) -> Option<Blob> {
    get_state_content_chunks(encoding, chunk_index, memory)
}

/// Delete an asset from a collection's store.
///
/// This function deletes an asset from a collection's store based on the specified parameters.
/// It returns a `Result<Option<Asset>, String>` where `Ok(Some(Asset))` indicates successful deletion
/// of the asset, `Ok(None)` represents no asset found for the specified path, or an error message
/// as `Err(String)` if the deletion encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the deletion.
/// - `collection`: A reference to the `CollectionKey` representing the collection from which to delete the asset.
/// - `full_path`: A `FullPath` identifying the asset to be deleted.
///
/// # Returns
/// - `Ok(Some(Asset))`: Indicates successful deletion of the asset.
/// - `Ok(None)`: Indicates no asset found for the specified path.
/// - `Err(String)`: An error message if the deletion operation fails.
///
/// This function allows you to securely delete assets from a Juno collection's store.
pub fn delete_asset_store(
    caller: Principal,
    collection: &CollectionKey,
    full_path: FullPath,
) -> Result<Option<Asset>, String> {
    let controllers: Controllers = get_controllers();
    let config = get_config_store();

    secure_delete_asset_impl(caller, &controllers, collection, full_path, &config)
}

pub fn delete_assets_store(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;

    let excluded_paths = vec![
        WELL_KNOWN_CUSTOM_DOMAINS.to_string(),
        WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string(),
    ];

    let should_include_asset =
        |asset_path: &String| collection != "#dapp" || !excluded_paths.contains(asset_path);

    let full_paths = match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            get_assets_heap(collection, &state_ref.heap.storage.assets)
                .iter()
                .filter(|(_, asset)| should_include_asset(&asset.key.full_path))
                .map(|(_, asset)| asset.key.full_path.clone())
                .collect()
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_assets_stable(collection, &state.borrow().stable.assets);
            stable
                .iter()
                .filter(|(_, asset)| should_include_asset(&asset.key.full_path))
                .map(|(_, asset)| asset.key.full_path.clone())
                .collect()
        }),
    };

    delete_assets_impl(&full_paths, collection, &rule)
}

pub fn list_assets_store(
    caller: Principal,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let controllers: Controllers = get_controllers();

    secure_list_assets_impl(caller, &controllers, collection, filters)
}

/// Get an asset from a collection's store.
///
/// This function retrieves an asset from a collection's store based on the specified parameters.
/// It returns a `Result<Option<Asset>, String>` where `Ok(Some(Asset))` indicates a successfully retrieved
/// asset, `Ok(None)` represents no asset found for the specified path, or an error message as `Err(String)`
/// if retrieval encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller requesting the asset.
/// - `collection`: A reference to the `CollectionKey` representing the collection from which to retrieve the asset.
/// - `full_path`: A `FullPath` identifying the asset to be retrieved.
///
/// # Returns
/// - `Ok(Some(Asset))`: Indicates successful retrieval of the asset.
/// - `Ok(None)`: Indicates no asset found for the specified path.
/// - `Err(String)`: An error message if the retrieval operation fails.
///
/// This function allows you to securely retrieve an asset from a Juno collection's store.
pub fn get_asset_store(
    caller: Principal,
    collection: &CollectionKey,
    full_path: FullPath,
) -> Result<Option<Asset>, String> {
    let controllers: Controllers = get_controllers();

    secure_get_asset_impl(caller, &controllers, collection, full_path)
}

fn secure_get_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    full_path: FullPath,
) -> Result<Option<Asset>, String> {
    let rule = get_state_rule(collection)?;

    get_asset_impl(caller, controllers, full_path, collection, &rule)
}

fn get_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    full_path: FullPath,
    collection: &CollectionKey,
    rule: &Rule,
) -> Result<Option<Asset>, String> {
    let asset = get_state_asset(collection, &full_path, rule);

    match asset {
        None => Ok(None),
        Some(asset) => {
            if !assert_permission(&rule.read, asset.key.owner, caller, controllers) {
                return Ok(None);
            }

            Ok(Some(asset))
        }
    }
}

pub fn get_public_asset_store(
    full_path: FullPath,
    token: Option<String>,
) -> Option<(Asset, Memory)> {
    let (asset, memory) = get_state_public_asset(&full_path);

    match asset {
        None => None,
        Some(asset) => match &asset.key.token {
            None => Some((asset.clone(), memory)),
            Some(asset_token) => {
                let protected_asset = get_token_protected_asset(&asset, asset_token, token);
                protected_asset.map(|protected_asset| (protected_asset, memory))
            }
        },
    }
}

fn get_token_protected_asset(
    asset: &Asset,
    asset_token: &String,
    token: Option<String>,
) -> Option<Asset> {
    match token {
        None => None,
        Some(token) => {
            if &token == asset_token {
                return Some(asset.clone());
            }

            None
        }
    }
}

pub fn assert_assets_collection_empty_store(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let assets = get_assets_heap(collection, &state_ref.heap.storage.assets);
            assert_assets_collection_empty_impl(&assets, collection)
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_assets_stable(collection, &state.borrow().stable.assets);
            let assets: Vec<(&FullPath, &Asset)> = stable
                .iter()
                .map(|(_, asset)| (&asset.key.full_path, asset))
                .collect();
            assert_assets_collection_empty_impl(&assets, collection)
        }),
    }
}

fn assert_assets_collection_empty_impl(
    assets: &[(&FullPath, &Asset)],
    collection: &CollectionKey,
) -> Result<(), String> {
    let values = filter_collection_values(collection.clone(), assets);

    if !values.is_empty() {
        return Err([COLLECTION_NOT_EMPTY, collection].join(""));
    }

    Ok(())
}

fn secure_list_assets_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let rule = get_state_rule(collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let assets = get_assets_heap(collection, &state_ref.heap.storage.assets);
            Ok(list_assets_impl(
                &assets,
                caller,
                controllers,
                collection,
                &rule,
                filters,
            ))
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_assets_stable(collection, &state.borrow().stable.assets);
            let assets: Vec<(&FullPath, &Asset)> = stable
                .iter()
                .map(|(_, asset)| (&asset.key.full_path, asset))
                .collect();
            Ok(list_assets_impl(
                &assets,
                caller,
                controllers,
                collection,
                &rule,
                filters,
            ))
        }),
    }
}

fn list_assets_impl(
    assets: &[(&FullPath, &Asset)],
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    rule: &Rule,
    filters: &ListParams,
) -> ListResults<AssetNoContent> {
    let matches = filter_values(
        caller,
        controllers,
        &rule.read,
        collection.clone(),
        filters,
        assets,
    );

    let values = list_values(&matches, filters);

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

fn secure_delete_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    full_path: FullPath,
    config: &StorageConfig,
) -> Result<Option<Asset>, String> {
    let rule = get_state_rule(collection)?;

    delete_asset_impl(caller, controllers, full_path, collection, &rule, config)
}

fn delete_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    full_path: FullPath,
    collection: &CollectionKey,
    rule: &Rule,
    config: &StorageConfig,
) -> Result<Option<Asset>, String> {
    let asset = get_state_asset(collection, &full_path, rule);

    match asset {
        None => Err(ERROR_ASSET_NOT_FOUND.to_string()),
        Some(asset) => {
            if !assert_permission(&rule.write, asset.key.owner, caller, controllers) {
                return Err(ERROR_ASSET_NOT_FOUND.to_string());
            }

            invoke_assert_delete_asset(&caller, &asset)?;

            let deleted = delete_state_asset(collection, &full_path, rule);
            delete_runtime_certified_asset(&asset);

            // We just removed the rewrite for /404.html in the certification tree therefore if /index.html exists, we want to reintroduce it as rewrite
            if *full_path == *ROOT_404_HTML {
                if let Some(index_asset) =
                    get_state_asset(collection, &ROOT_INDEX_HTML.to_string(), rule)
                {
                    update_runtime_certified_asset(&index_asset, config);
                }
            }

            Ok(deleted)
        }
    }
}

fn delete_assets_impl(
    full_paths: &Vec<FullPath>,
    collection: &CollectionKey,
    rule: &Rule,
) -> Result<(), String> {
    for full_path in full_paths {
        let deleted_asset = delete_state_asset(collection, full_path, rule);

        match deleted_asset {
            None => {}
            Some(deleted_asset) => {
                delete_runtime_certified_asset(&deleted_asset);
            }
        }
    }

    Ok(())
}

/// Count the number of assets in a collection's store.
///
/// This function retrieves the state rule for the specified collection and counts the assets
/// based on the memory type (Heap or Stable). It returns the count as a `Result<usize, String>`
/// on success, or an error message as `Err(String)` if an issue occurs during counting.
///
/// # Parameters
/// - `collection`: A reference to the `CollectionKey` representing the collection to count assets in.
///
/// # Returns
/// - `Ok(usize)`: The count of assets in the collection.
/// - `Err(String)`: An error message if counting fails.
///
/// This function provides a convenient way to determine the number of assets in a Juno collection's store.
pub fn count_assets_store(collection: &CollectionKey) -> Result<usize, String> {
    let rule = get_state_rule(collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let length = count_assets_heap(collection, &state_ref.heap.storage.assets);
            Ok(length)
        }),
        Memory::Stable => STATE.with(|state| {
            let length = count_assets_stable(collection, &state.borrow().stable.assets);
            Ok(length)
        }),
    }
}

///
/// Upload batch and chunks
///

pub fn create_batch_store(caller: Principal, init: InitAssetKey) -> Result<BatchId, String> {
    let controllers: Controllers = get_controllers();
    secure_create_batch_impl(caller, &controllers, init)
}

pub fn create_chunk_store(caller: Principal, chunk: UploadChunk) -> Result<ChunkId, &'static str> {
    create_chunk(caller, chunk)
}

pub fn commit_batch_store(caller: Principal, commit_batch: CommitBatch) -> Result<Asset, String> {
    let controllers: Controllers = get_controllers();

    let asset = commit_batch_storage(
        caller,
        &controllers,
        commit_batch,
        &StorageAssertions,
        &StorageState,
        &StorageUpload,
    )?;

    let config = get_config();

    update_runtime_certified_asset(&asset, &config);

    Ok(asset)
}

fn secure_create_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    init: InitAssetKey,
) -> Result<BatchId, String> {
    let rule = get_state_rule(&init.collection)?;

    if !(public_permission(&rule.write)
        || is_known_user(caller)
        || is_controller(caller, controllers))
    {
        return Err(UPLOAD_NOT_ALLOWED.to_string());
    }

    create_batch(caller, controllers, init)
}

///
/// Config
///

pub fn set_config_store(config: &StorageConfig) {
    insert_state_config(config);

    init_runtime_certified_assets();
}

pub fn get_config_store() -> StorageConfig {
    get_state_config()
}

///
/// Domain
///

pub fn set_domain_store(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_domain_impl(domain_name, bn_id)
}

pub fn delete_domain_store(domain_name: &DomainName) -> Result<(), String> {
    delete_domain_impl(domain_name)
}

pub fn get_custom_domains_store() -> CustomDomains {
    get_state_domains()
}

fn delete_domain_impl(domain_name: &DomainName) -> Result<(), String> {
    delete_state_domain(domain_name);

    update_custom_domains_asset(&StorageState)
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_state_domain_impl(domain_name, bn_id);

    update_custom_domains_asset(&StorageState)
}

fn set_state_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) {
    let domain = get_state_domain(domain_name);

    let now = time();

    let created_at: Timestamp = match domain.clone() {
        None => now,
        Some(domain) => domain.created_at,
    };

    let version: Version = match domain {
        None => INITIAL_VERSION,
        Some(domain) => domain.version.unwrap_or_default() + 1,
    };

    let updated_at: Timestamp = now;

    let custom_domain = CustomDomain {
        bn_id: bn_id.to_owned(),
        created_at,
        updated_at,
        version: Some(version),
    };

    insert_state_domain(domain_name, &custom_domain);
}

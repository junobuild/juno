use crate::controllers::store::get_controllers;
use crate::memory::internal::STATE;
use crate::storage::assert::{
    assert_create_batch, assert_delete_asset, assert_get_asset, assert_list_assets,
};
use crate::storage::certified_assets::runtime::init_certified_assets as init_runtime_certified_assets;
use crate::storage::state::{
    count_assets_stable, delete_asset as delete_state_asset, delete_domain as delete_state_domain,
    get_asset as get_state_asset, get_assets_stable, get_config as get_state_config, get_config,
    get_content_chunks as get_state_content_chunks, get_domain as get_state_domain,
    get_domains as get_state_domains, get_public_asset as get_state_public_asset,
    get_rule as get_state_rule, insert_config as insert_state_config,
    insert_domain as insert_state_domain,
};
use crate::storage::strategy_impls::{StorageAssertions, StorageState, StorageUpload};
use crate::types::store::StoreContext;
use candid::Principal;
use junobuild_collections::msg::msg_storage_collection_not_empty;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::list::list_values;
use junobuild_shared::types::core::{Blob, DomainName};
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::Controllers;
use junobuild_storage::constants::{ROOT_404_HTML, ROOT_INDEX_HTML};
use junobuild_storage::errors::JUNO_STORAGE_ERROR_ASSET_NOT_FOUND;
use junobuild_storage::heap_utils::{
    collect_assets_heap, collect_delete_assets_heap, count_assets_heap,
};
use junobuild_storage::runtime::{
    delete_certified_asset as delete_runtime_certified_asset,
    update_certified_asset as update_runtime_certified_asset,
};
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_batch, create_chunk};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::{AssetNoContent, CommitBatch, InitAssetKey, UploadChunk};
use junobuild_storage::types::runtime_state::{BatchId, ChunkId};
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};
use junobuild_storage::utils::{
    filter_collection_values, filter_values, get_token_protected_asset, map_asset_no_content,
    should_include_asset_for_deletion,
};
use junobuild_storage::well_known::update::update_custom_domains_asset;
use junobuild_storage::well_known::utils::build_custom_domain;

// ---------------------------------------------------------
// Getter, list and delete
// ---------------------------------------------------------

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

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection,
    };

    secure_delete_asset_impl(&context, full_path, &config)
}

/// Delete multiple assets from a collection.
///
/// This function deletes multiple assets from a collection's store based on the specified collection key.
/// It returns a `Result<(), String>` where `Ok(())` indicates successful deletion, or an error message
/// as `Err(String)` if the deletion encounters issues.
///
/// # Parameters
/// - `collection`: A reference to the `CollectionKey` representing the collection from which to delete assets.
///
/// # Returns
/// - `Ok(())`: Indicates successful deletion of assets.
/// - `Err(String)`: An error message if the deletion operation fails.
///
/// This function allows you to securely delete multiple assets from a Juno collection's of the Storage.
pub fn delete_assets_store(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;

    let full_paths = match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            collect_delete_assets_heap(collection, &state_ref.heap.storage.assets)
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_assets_stable(collection, &state.borrow().stable.assets);
            stable
                .iter()
                .filter(|(_, asset)| {
                    should_include_asset_for_deletion(collection, &asset.key.full_path)
                })
                .map(|(_, asset)| asset.key.full_path.clone())
                .collect()
        }),
    };

    delete_assets_impl(&full_paths, collection, &rule)
}

/// List assets in a collection.
///
/// This function retrieves a list of assets from a collection's store based on the specified parameters.
/// It returns a `Result<ListResults<AssetNoContent>, String>` where `Ok(ListResults)` contains the retrieved assets,
/// or an error message as `Err(String)` if the operation encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the operation. If used in serverless functions, you can use `ic_cdk::id()` to pass an administrator controller.
/// - `collection`: A reference to the `CollectionKey` representing the collection from which to list the assets.
/// - `filters`: A reference to `ListParams` containing the filter criteria for listing the assets.
///
/// # Returns
/// - `Ok(ListResults<AssetNoContent>)`: Contains the list of retrieved assets, without their content, matching the filter criteria.
/// - `Err(String)`: An error message if the operation fails.
///
/// This function lists assets in a Juno collection's store, applying the specified filter criteria to retrieve the assets.
/// The returned list includes the assets without their content (`AssetNoContent`), which is useful for operations where only
/// metadata or references are needed.
pub fn list_assets_store(
    caller: Principal,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let controllers: Controllers = get_controllers();

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection,
    };

    secure_list_assets_impl(&context, filters)
}

/// Count assets in a collection.
///
/// This function retrieves the count of assets from a collection's store based on the specified parameters.
/// It returns a `Result<usize, String>` where `Ok(usize)` contains the count of assets matching the filter criteria,
/// or an error message as `Err(String)` if the operation encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the operation. If used in serverless functions, you can use `ic_cdk::id()` to pass an administrator controller.
/// - `collection`: A reference to the `CollectionKey` representing the collection from which to count the assets.
/// - `filters`: A reference to `ListParams` containing the filter criteria for counting the assets.
///
/// # Returns
/// - `Ok(usize)`: Contains the count of assets matching the filter criteria.
/// - `Err(String)`: An error message if the operation fails.
///
/// This function counts assets in a Juno collection's store by listing them and then determining the length of the result set.
///
/// # Note
/// This implementation can be improved, as it currently relies on `list_assets_store` underneath, meaning that all assets matching the filter criteria are still read from the store. This might lead to unnecessary overhead, especially for large collections. Optimizing this function to count assets directly without retrieving them could enhance performance.
pub fn count_assets_store(
    caller: Principal,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<usize, String> {
    let results = list_assets_store(caller, collection, filters)?;
    Ok(results.items_length)
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

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection,
    };

    secure_get_asset_impl(&context, full_path)
}

fn secure_get_asset_impl(
    context: &StoreContext,
    full_path: FullPath,
) -> Result<Option<Asset>, String> {
    let rule = get_state_rule(context.collection)?;

    get_asset_impl(context, full_path, &rule)
}

fn get_asset_impl(
    context: &StoreContext,
    full_path: FullPath,
    rule: &Rule,
) -> Result<Option<Asset>, String> {
    let asset = get_state_asset(context.collection, &full_path, rule);

    match asset {
        None => Ok(None),
        Some(asset) => {
            if assert_get_asset(context, rule, &asset).is_err() {
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

pub fn assert_assets_collection_empty_store(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let assets = collect_assets_heap(collection, &state_ref.heap.storage.assets);
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
        return Err(msg_storage_collection_not_empty(collection));
    }

    Ok(())
}

fn secure_list_assets_impl(
    context: &StoreContext,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    assert_list_assets(context)?;

    let rule = get_state_rule(context.collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let assets = collect_assets_heap(context.collection, &state_ref.heap.storage.assets);
            Ok(list_assets_impl(&assets, context, &rule, filters))
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_assets_stable(context.collection, &state.borrow().stable.assets);
            let assets: Vec<(&FullPath, &Asset)> = stable
                .iter()
                .map(|(_, asset)| (&asset.key.full_path, asset))
                .collect();
            Ok(list_assets_impl(&assets, context, &rule, filters))
        }),
    }
}

fn list_assets_impl(
    assets: &[(&FullPath, &Asset)],
    &StoreContext {
        caller,
        controllers,
        collection,
    }: &StoreContext,
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
    context: &StoreContext,
    full_path: FullPath,
    config: &StorageConfig,
) -> Result<Option<Asset>, String> {
    let rule = get_state_rule(context.collection)?;

    delete_asset_impl(context, full_path, &rule, config)
}

fn delete_asset_impl(
    context: &StoreContext,
    full_path: FullPath,
    rule: &Rule,
    config: &StorageConfig,
) -> Result<Option<Asset>, String> {
    let asset = get_state_asset(context.collection, &full_path, rule);

    match asset {
        None => Err(JUNO_STORAGE_ERROR_ASSET_NOT_FOUND.to_string()),
        Some(asset) => {
            assert_delete_asset(context, rule, &asset)?;

            let deleted = delete_state_asset(context.collection, &full_path, rule);
            delete_runtime_certified_asset(&asset);

            // We just removed the rewrite for /404.html in the certification tree therefore if /index.html exists, we want to reintroduce it as rewrite
            if *full_path == *ROOT_404_HTML {
                if let Some(index_asset) =
                    get_state_asset(context.collection, &ROOT_INDEX_HTML.to_string(), rule)
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
pub fn count_collection_assets_store(collection: &CollectionKey) -> Result<usize, String> {
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

/// Delete multiple assets from a collection's store based on filter criteria.
///
/// This function deletes assets from a collection's store that match the specified filter criteria.
/// It returns a `Result<Vec<Option<Asset>>, String>`, where `Ok(Vec<Option<Asset>>)` contains a vector of
/// `Option<Asset>` values for each deleted asset (or `None` if no asset was found for that entry), or an
/// error message as `Err(String)` if the deletion encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the deletion.
/// - `collection`: A `CollectionKey` representing the collection from which to delete the assets.
/// - `filters`: A reference to `ListParams` containing the filter criteria for selecting assets to delete.
///
/// # Returns
/// - `Ok(Vec<Option<Asset>>)`:
///   - Each element in the vector represents the result of a delete operation for an asset:
///     - `Some(Asset)`: The successfully deleted asset.
///     - `None`: Indicates no asset found matching the specified filter criteria for this entry.
/// - `Err(String)`: An error message if the deletion operation fails.
///
/// This function allows batch deletion of assets in a Juno collection's store that match the specified
/// filter criteria, providing context for each deleted asset or error messages if any issues occur.
pub fn delete_filtered_assets_store(
    caller: Principal,
    collection: CollectionKey,
    filters: &ListParams,
) -> Result<Vec<Option<Asset>>, String> {
    let controllers: Controllers = get_controllers();

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection: &collection,
    };

    let assets = secure_list_assets_impl(&context, filters)?;

    delete_filtered_assets_store_impl(&context, &assets)
}

fn delete_filtered_assets_store_impl(
    context: &StoreContext,
    assets: &ListResults<AssetNoContent>,
) -> Result<Vec<Option<Asset>>, String> {
    let rule = get_state_rule(context.collection)?;
    let config = get_config_store();

    let mut results: Vec<Option<Asset>> = Vec::new();

    for (_, asset) in &assets.items {
        let deleted_asset =
            delete_asset_impl(context, asset.key.full_path.clone(), &rule, &config)?;

        results.push(deleted_asset);
    }

    Ok(results)
}

// ---------------------------------------------------------
// Upload batch and chunks
// ---------------------------------------------------------

pub fn create_batch_store(caller: Principal, init: InitAssetKey) -> Result<BatchId, String> {
    let controllers: Controllers = get_controllers();
    let config = get_config();

    secure_create_batch_impl(caller, &controllers, &config, init)
}

pub fn create_chunk_store(caller: Principal, chunk: UploadChunk) -> Result<ChunkId, String> {
    let config = get_config();

    create_chunk(caller, &config, chunk)
}

pub fn commit_batch_store(caller: Principal, commit_batch: CommitBatch) -> Result<Asset, String> {
    let controllers: Controllers = get_controllers();
    let config = get_config();

    let asset = commit_batch_storage(
        caller,
        &controllers,
        &config,
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
    config: &StorageConfig,
    init: InitAssetKey,
) -> Result<BatchId, String> {
    let rule = get_state_rule(&init.collection)?;

    assert_create_batch(caller, controllers, &rule)?;

    create_batch(caller, controllers, config, init, None, &StorageState)
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn set_config_store(config: &StorageConfig) {
    insert_state_config(config);

    init_runtime_certified_assets();
}

pub fn get_config_store() -> StorageConfig {
    get_state_config()
}

// ---------------------------------------------------------
// Domain
// ---------------------------------------------------------

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

    let custom_domain = build_custom_domain(domain, bn_id);

    insert_state_domain(domain_name, &custom_domain);
}

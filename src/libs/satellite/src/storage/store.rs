use crate::assert::assert_description_length;
use crate::controllers::store::get_controllers;
use crate::hooks::{invoke_assert_delete_asset, invoke_assert_upload_asset};
use crate::memory::STATE;
use crate::msg::{
    COLLECTION_NOT_EMPTY, ERROR_ASSET_NOT_FOUND, ERROR_CANNOT_COMMIT_BATCH, UPLOAD_NOT_ALLOWED,
};
use candid::Principal;
use ic_cdk::api::time;
use junobuild_collections::assert_stores::{
    assert_create_permission, assert_permission, public_permission,
};
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::list::list_values;
use junobuild_shared::types::state::{Controllers, Timestamp, Version};
use junobuild_shared::utils::principal_not_equal;
use std::collections::HashMap;

use crate::rules::assert_stores::is_known_user;
use crate::storage::constants::{
    ASSET_ENCODING_NO_COMPRESSION, ENCODING_CERTIFICATION_ORDER, ROOT_404_HTML, ROOT_INDEX_HTML,
    WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS,
};
use crate::storage::runtime::{
    clear_batch as clear_runtime_batch, clear_expired_batches as clear_expired_runtime_batches,
    clear_expired_chunks as clear_expired_runtime_chunks,
    delete_certified_asset as delete_runtime_certified_asset, get_batch as get_runtime_batch,
    get_chunk as get_runtime_chunk, init_certified_assets as init_runtime_certified_assets,
    insert_batch as insert_runtime_batch, insert_chunk as insert_runtime_chunk,
    update_certified_asset as update_runtime_certified_asset,
};
use crate::storage::state::{
    count_assets_heap, count_assets_stable, delete_asset as delete_state_asset,
    delete_domain as delete_state_domain, get_asset as get_state_asset, get_assets_heap,
    get_assets_stable, get_config as get_state_config,
    get_content_chunks as get_state_content_chunks, get_domain as get_state_domain,
    get_domains as get_state_domains, get_public_asset as get_state_public_asset,
    get_rule as get_state_rule, insert_asset as insert_state_asset,
    insert_asset_encoding as insert_state_asset_encoding, insert_config as insert_state_config,
    insert_domain as insert_state_domain,
};
use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::{CustomDomain, CustomDomains};
use crate::storage::types::interface::{AssetNoContent, CommitBatch, InitAssetKey, UploadChunk};
use crate::storage::types::state::FullPath;
use crate::storage::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, AssetKey, Batch, Chunk, EncodingType,
};
use crate::storage::utils::{filter_collection_values, filter_values, map_asset_no_content};
use crate::storage::well_known::update::update_custom_domains_asset;
use junobuild_shared::types::core::{Blob, CollectionKey, DomainName};
use junobuild_shared::types::list::{ListParams, ListResults};

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

const BATCH_EXPIRY_NANOS: u64 = 300_000_000_000;

static mut NEXT_BATCH_ID: u128 = 0;
static mut NEXT_CHUNK_ID: u128 = 0;

pub fn create_batch_store(caller: Principal, init: InitAssetKey) -> Result<u128, String> {
    let controllers: Controllers = get_controllers();
    secure_create_batch_impl(caller, &controllers, init)
}

pub fn create_chunk_store(caller: Principal, chunk: UploadChunk) -> Result<u128, &'static str> {
    create_chunk_impl(caller, chunk)
}

pub fn commit_batch_store(caller: Principal, commit_batch: CommitBatch) -> Result<Asset, String> {
    let controllers: Controllers = get_controllers();
    let config = get_config_store();

    commit_batch_impl(caller, &controllers, commit_batch, &config)
}

fn secure_create_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    init: InitAssetKey,
) -> Result<u128, String> {
    let rule = get_state_rule(&init.collection)?;

    if !(public_permission(&rule.write)
        || is_known_user(caller)
        || is_controller(caller, controllers))
    {
        return Err(UPLOAD_NOT_ALLOWED.to_string());
    }

    assert_key(caller, &init.full_path, &init.collection, controllers)?;

    assert_description_length(&init.description)?;

    // Assert supported encoding type
    get_encoding_type(&init.encoding_type)?;

    Ok(create_batch_impl(caller, init))
}

fn create_batch_impl(
    caller: Principal,
    InitAssetKey {
        token,
        name,
        collection,
        encoding_type,
        full_path,
        description,
    }: InitAssetKey,
) -> u128 {
    let now = time();

    unsafe {
        clear_expired_batches();

        NEXT_BATCH_ID += 1;

        let key: AssetKey = AssetKey {
            full_path,
            collection,
            owner: caller,
            token,
            name,
            description,
        };

        insert_runtime_batch(
            &NEXT_BATCH_ID,
            Batch {
                key,
                expires_at: now + BATCH_EXPIRY_NANOS,
                encoding_type,
            },
        );

        NEXT_BATCH_ID
    }
}

fn create_chunk_impl(
    caller: Principal,
    UploadChunk {
        batch_id,
        content,
        order_id,
    }: UploadChunk,
) -> Result<u128, &'static str> {
    let batch = get_runtime_batch(&batch_id);

    match batch {
        None => Err("Batch not found."),
        Some(b) => {
            if principal_not_equal(caller, b.key.owner) {
                return Err("Bach initializer does not match chunk uploader.");
            }

            let now = time();

            // Update batch to extend expires_at
            insert_runtime_batch(
                &batch_id,
                Batch {
                    key: b.key.clone(),
                    expires_at: now + BATCH_EXPIRY_NANOS,
                    encoding_type: b.encoding_type,
                },
            );

            unsafe {
                NEXT_CHUNK_ID += 1;

                insert_runtime_chunk(
                    &NEXT_CHUNK_ID,
                    Chunk {
                        batch_id,
                        content,
                        order_id: order_id.unwrap_or(NEXT_CHUNK_ID),
                    },
                );

                Ok(NEXT_CHUNK_ID)
            }
        }
    }
}

fn commit_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    config: &StorageConfig,
) -> Result<Asset, String> {
    let batch = get_runtime_batch(&commit_batch.batch_id);

    match batch {
        None => Err(ERROR_CANNOT_COMMIT_BATCH.to_string()),
        Some(b) => {
            let asset = secure_commit_chunks(caller, controllers, commit_batch, &b)?;
            update_runtime_certified_asset(&asset, config);
            Ok(asset)
        }
    }
}

fn assert_key(
    caller: Principal,
    full_path: &FullPath,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> Result<(), &'static str> {
    // /.well-known/ic-domains is automatically generated for custom domains
    assert_well_known_key(full_path, WELL_KNOWN_CUSTOM_DOMAINS)?;

    // /.well-known/ii-alternative-origins is automatically generated for alternative origins
    assert_well_known_key(full_path, WELL_KNOWN_II_ALTERNATIVE_ORIGINS)?;

    let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;

    // Only controllers can write in collection #dapp
    if collection.clone() == *dapp_collection && !is_controller(caller, controllers) {
        return Err(UPLOAD_NOT_ALLOWED);
    }

    // Asset uploaded by users should be prefixed with the collection. That way developers can organize assets to particular folders.
    if collection.clone() != *dapp_collection
        && !full_path.starts_with(&["/", collection, "/"].join(""))
    {
        return Err("Asset path must be prefixed with collection key.");
    }

    Ok(())
}

fn assert_well_known_key(full_path: &str, reserved_path: &str) -> Result<(), &'static str> {
    if full_path == reserved_path {
        let error = format!("{} is a reserved asset.", reserved_path);
        return Err(Box::leak(error.into_boxed_str()));
    }
    Ok(())
}

fn secure_commit_chunks(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
) -> Result<Asset, String> {
    // The one that started the batch should be the one that commits it
    if principal_not_equal(caller, batch.key.owner) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_key(
        caller,
        &batch.key.full_path,
        &batch.key.collection,
        controllers,
    )?;

    let rule = get_state_rule(&batch.key.collection)?;

    let current = get_state_asset(&batch.key.collection, &batch.key.full_path, &rule);

    match current {
        None => {
            if !assert_create_permission(&rule.write, caller, controllers) {
                return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
            }

            commit_chunks(caller, commit_batch, batch, &rule, &None)
        }
        Some(current) => {
            secure_commit_chunks_update(caller, controllers, commit_batch, batch, rule, current)
        }
    }
}

fn secure_commit_chunks_update(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
    rule: Rule,
    current: Asset,
) -> Result<Asset, String> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err("Provided collection does not match existing collection.".to_string());
    }

    if !assert_permission(&rule.write, current.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    commit_chunks(caller, commit_batch, batch, &rule, &Some(current))
}

fn commit_chunks(
    caller: Principal,
    commit_batch: CommitBatch,
    batch: &Batch,
    rule: &Rule,
    current: &Option<Asset>,
) -> Result<Asset, String> {
    let now = time();

    if now > batch.expires_at {
        clear_expired_batches();
        return Err("Batch did not complete in time. Chunks cannot be committed.".to_string());
    }

    invoke_assert_upload_asset(
        &caller,
        &AssetAssertUpload {
            current: current.clone(),
            batch: batch.clone(),
            commit_batch: commit_batch.clone(),
        },
    )?;

    let CommitBatch {
        chunk_ids,
        batch_id,
        headers,
    } = commit_batch;

    // Collect all chunks
    let mut chunks: Vec<Chunk> = vec![];

    for chunk_id in chunk_ids.iter() {
        let chunk = get_runtime_chunk(chunk_id);

        match chunk {
            None => {
                return Err("Chunk does not exist.".to_string());
            }
            Some(c) => {
                if batch_id != c.batch_id {
                    return Err("Chunk not included in the provided batch.".to_string());
                }

                chunks.push(c);
            }
        }
    }

    // Sort with ordering
    chunks.sort_by(|a, b| a.order_id.cmp(&b.order_id));

    let mut content_chunks: Vec<Blob> = vec![];

    // Collect content
    for c in chunks.iter() {
        content_chunks.push(c.content.clone());
    }

    if content_chunks.is_empty() {
        return Err("No chunk to commit.".to_string());
    }

    // We clone the key with the new information provided by the upload (name, full_path, token, etc.) to set the new key.
    // However, the owner remains the one who originally created the asset.
    let owner = current.as_ref().map_or(caller, |asset| asset.key.owner);

    let key = AssetKey {
        owner,
        ..batch.clone().key
    };

    let now = time();

    let mut asset: Asset = Asset {
        key,
        headers,
        encodings: HashMap::new(),
        created_at: now,
        updated_at: now,
        version: Some(INITIAL_VERSION),
    };

    if let Some(existing_asset) = current {
        asset.encodings = existing_asset.encodings.clone();
        asset.created_at = existing_asset.created_at;
        asset.version = Some(existing_asset.version.unwrap_or_default() + 1);
    }

    let encoding_type = get_encoding_type(&batch.encoding_type)?;

    let encoding = AssetEncoding::from(&content_chunks);

    match rule.max_size {
        None => (),
        Some(max_size) => {
            if encoding.total_length > max_size {
                clear_runtime_batch(&batch_id, &chunk_ids);
                return Err("Asset exceed max allowed size.".to_string());
            }
        }
    }

    insert_state_asset_encoding(
        &batch.clone().key.full_path,
        &encoding_type,
        &encoding,
        &mut asset,
        rule,
    );

    insert_state_asset(
        &batch.clone().key.collection,
        &batch.clone().key.full_path,
        &asset,
        rule,
    );

    clear_runtime_batch(&batch_id, &chunk_ids);

    Ok(asset)
}

fn get_encoding_type(encoding_type: &Option<EncodingType>) -> Result<EncodingType, &'static str> {
    let provided_type = encoding_type
        .clone()
        .unwrap_or_else(|| ASSET_ENCODING_NO_COMPRESSION.to_string());

    let matching_type = Vec::from(ENCODING_CERTIFICATION_ORDER)
        .iter()
        .any(|&e| *e == provided_type);

    if !matching_type {
        return Err("Asset encoding not supported for certification purpose.");
    }

    Ok(provided_type)
}

fn clear_expired_batches() {
    // Remove expired batches
    clear_expired_runtime_batches();

    // Remove chunk without existing batches (those we just deleted above)
    clear_expired_runtime_chunks();
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

    update_custom_domains_asset()
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_state_domain_impl(domain_name, bn_id);

    update_custom_domains_asset()
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

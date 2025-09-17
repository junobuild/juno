use crate::assets::storage::types::state::{
    AssetsStable, ContentChunksStable, StableEncodingChunkKey, StableKey,
};
use crate::memory::internal::STATE;
use crate::types::state::{StableState, State};
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::msg::msg_storage_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_collections::utils::range_collection_end;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::structures::collect_stable_vec;
use junobuild_shared::types::core::{Blob, DomainName};
use junobuild_shared::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::stable_utils::insert_asset_encoding_stable;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{AssetsHeap, FullPath, StorageHeapState};
use junobuild_storage::types::store::{Asset, AssetEncoding};
use junobuild_storage::utils::clone_asset_encoding_content_chunks;
use std::borrow::Cow;
use std::ops::RangeBounds;
// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn get_public_asset(full_path: &FullPath) -> (Option<Asset>, Memory) {
    STATE.with(|state| get_public_asset_impl(full_path, &state.borrow()))
}

fn get_public_asset_impl(full_path: &FullPath, state: &State) -> (Option<Asset>, Memory) {
    // We cannot know on the web which memory has been used. That's why we try first to get the asset from heap for performance reason.
    let heap_asset = get_asset_heap(full_path, &state.heap.storage.assets);

    if let Some(heap_asset) = heap_asset {
        return (Some(heap_asset), Memory::Heap);
    }

    // If it was not found on the heap we try to find the asset on stable in case the dev is using stable memory for the dapp collection.
    let stable_dapp_asset = get_asset_stable(
        &COLLECTION_ASSET_KEY.to_string(),
        full_path,
        &state.stable.assets,
    );

    if let Some(stable_asset) = stable_dapp_asset {
        return (Some(stable_asset), Memory::Stable);
    }

    // Ultimately, we try to resolve the asset in the custom collections of the dev.
    get_dev_public_asset_stable(full_path, &state.stable.assets)
}

pub fn get_dev_public_asset_stable(
    full_path: &FullPath,
    assets: &AssetsStable,
) -> (Option<Asset>, Memory) {
    // full_path examples:
    // /index.html
    // /images/hello.png
    let parts: Vec<&str> = full_path.split('/').collect();

    // Developer custom storage collections should contain assets prefixed with the collection (/collection/something)
    // If the path does not contain any relative subfolder, we already know it is not a custom collection.

    if parts.len() <= 2 {
        return (None, Memory::Stable);
    }

    // full_path always starts with / (we ensure this when we map the url). Split will result in a first element equals to "".
    // /images/index.png => ["", "images", "index.png"]
    match parts.get(1) {
        None => (None, Memory::Stable),
        Some(collection) => (
            get_asset_stable(&collection.to_string(), full_path, assets),
            Memory::Stable,
        ),
    }
}

pub fn get_asset(collection: &CollectionKey, full_path: &FullPath, rule: &Rule) -> Option<Asset> {
    match rule.mem() {
        Memory::Heap => {
            STATE.with(|state| get_asset_heap(full_path, &state.borrow().heap.storage.assets))
        }
        Memory::Stable => STATE
            .with(|state| get_asset_stable(collection, full_path, &state.borrow().stable.assets)),
    }
}

pub fn get_content_chunks(
    encoding: &AssetEncoding,
    chunk_index: usize,
    memory: &Memory,
) -> Option<Blob> {
    match memory {
        Memory::Heap => {
            let content_chunks = clone_asset_encoding_content_chunks(encoding, chunk_index);
            Some(content_chunks)
        }
        Memory::Stable => STATE.with(|state| {
            get_content_chunks_stable(encoding, chunk_index, &state.borrow().stable.content_chunks)
        }),
    }
}

pub fn insert_asset_encoding(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
    rule: &Rule,
) {
    match rule.mem() {
        Memory::Heap => {
            asset
                .encodings
                .insert(encoding_type.to_owned(), encoding.clone());
        }
        Memory::Stable => STATE.with(|state| {
            insert_asset_encoding_stable(
                full_path,
                encoding_type,
                encoding,
                asset,
                stable_encoding_chunk_key,
                &mut state.borrow_mut().stable.content_chunks,
            )
        }),
    }
}

pub fn insert_asset(collection: &CollectionKey, full_path: &FullPath, asset: &Asset, rule: &Rule) {
    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            insert_asset_heap(
                full_path,
                asset,
                &mut state.borrow_mut().heap.storage.assets,
            )
        }),
        Memory::Stable => STATE.with(|state| {
            insert_asset_stable(
                collection,
                full_path,
                asset,
                &mut state.borrow_mut().stable.assets,
            )
        }),
    }
}

pub fn delete_asset(
    collection: &CollectionKey,
    full_path: &FullPath,
    rule: &Rule,
) -> Option<Asset> {
    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            delete_asset_heap(full_path, &mut state.borrow_mut().heap.storage.assets)
        }),
        Memory::Stable => STATE.with(|state| {
            delete_content_chunks_stable(collection, full_path, &mut state.borrow_mut().stable);
            delete_asset_stable(collection, full_path, &mut state.borrow_mut().stable.assets)
        }),
    }
}

// Get

fn get_asset_stable(
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &AssetsStable,
) -> Option<Asset> {
    assets.get(&stable_full_path(collection, full_path))
}

fn get_content_chunks_stable(
    encoding: &AssetEncoding,
    chunk_index: usize,
    content_chunks: &ContentChunksStable,
) -> Option<Blob> {
    let key: StableEncodingChunkKey =
        deserialize_from_bytes(Cow::Owned(encoding.content_chunks[chunk_index].clone()));
    content_chunks.get(&key)
}

fn get_asset_heap(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

// Delete

fn delete_asset_stable(
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &mut AssetsStable,
) -> Option<Asset> {
    assets.remove(&stable_full_path(collection, full_path))
}

fn delete_content_chunks_stable(
    collection: &CollectionKey,
    full_path: &FullPath,
    state: &mut StableState,
) {
    if let Some(asset) = get_asset_stable(collection, full_path, &state.assets) {
        for (_, encoding) in asset.encodings.iter() {
            for chunk in encoding.content_chunks.iter() {
                let key: StableEncodingChunkKey = deserialize_from_bytes(Cow::Owned(chunk.clone()));
                state.content_chunks.remove(&key);
            }
        }
    }
}

fn delete_asset_heap(full_path: &FullPath, assets: &mut AssetsHeap) -> Option<Asset> {
    assets.remove(full_path)
}

// Insert

fn insert_asset_stable(
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut AssetsStable,
) {
    assets.insert(stable_full_path(collection, full_path), asset.clone());
}

fn insert_asset_heap(full_path: &FullPath, asset: &Asset, assets: &mut AssetsHeap) {
    assets.insert(full_path.clone(), asset.clone());
}

// List

pub fn get_assets_stable(
    collection: &CollectionKey,
    assets: &AssetsStable,
) -> Vec<(StableKey, Asset)> {
    collect_stable_vec(assets.range(filter_assets_range(collection)))
}

pub fn count_assets_stable(collection: &CollectionKey, assets: &AssetsStable) -> usize {
    assets.range(filter_assets_range(collection)).count()
}

fn filter_assets_range(collection: &CollectionKey) -> impl RangeBounds<StableKey> {
    let start_key = StableKey {
        collection: collection.clone(),
        full_path: "".to_string(),
    };

    let end_key = StableKey {
        collection: range_collection_end(collection).clone(),
        full_path: "".to_string(),
    };

    start_key..end_key
}

fn stable_full_path(collection: &CollectionKey, full_path: &FullPath) -> StableKey {
    StableKey {
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

fn stable_encoding_chunk_key(
    full_path: &FullPath,
    encoding_type: &str,
    chunk_index: usize,
) -> StableEncodingChunkKey {
    StableEncodingChunkKey {
        full_path: full_path.clone(),
        encoding_type: encoding_type.to_owned(),
        chunk_index,
    }
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let rules = &state.borrow().heap.storage.rules.clone();
        let rule = rules.get(collection);

        rule.cloned()
    });

    match rule {
        None => Err(msg_storage_collection_not_found(collection)),
        Some(rule) => Ok(rule),
    }
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn get_domains() -> CustomDomains {
    STATE.with(|state| state.borrow().heap.storage.custom_domains.clone())
}

pub fn get_domain(domain_name: &DomainName) -> Option<CustomDomain> {
    STATE.with(|state| {
        let domains = state.borrow().heap.storage.custom_domains.clone();
        let domain = domains.get(domain_name);
        domain.cloned()
    })
}

pub fn insert_domain(domain_name: &DomainName, custom_domain: &CustomDomain) {
    STATE.with(|state| {
        insert_domain_impl(
            domain_name,
            custom_domain,
            &mut state.borrow_mut().heap.storage.custom_domains,
        )
    })
}

pub fn delete_domain(domain_name: &DomainName) {
    STATE.with(|state| {
        delete_domain_impl(
            domain_name,
            &mut state.borrow_mut().heap.storage.custom_domains,
        )
    })
}

fn insert_domain_impl(
    domain_name: &DomainName,
    custom_domain: &CustomDomain,
    custom_domains: &mut CustomDomains,
) {
    custom_domains.insert(domain_name.clone(), custom_domain.clone());
}

fn delete_domain_impl(domain_name: &DomainName, custom_domains: &mut CustomDomains) {
    custom_domains.remove(domain_name);
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.storage.config.clone())
}

pub fn insert_config(config: &StorageConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn insert_config_impl(config: &StorageConfig, state: &mut StorageHeapState) {
    state.config = config.clone();
}

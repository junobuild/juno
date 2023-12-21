use crate::list::utils::range_collection_end;
use crate::memory::STATE;
use crate::msg::COLLECTION_NOT_FOUND;
use crate::rules::types::rules::{Memory, Rule};
use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::{CustomDomain, CustomDomains, DomainName};
use crate::storage::types::state::{
    AssetsHeap, AssetsStable, ContentChunksStable, FullPath, StableEncodingChunkKey, StableKey,
    StorageHeapState,
};
use crate::storage::types::store::{Asset, AssetEncoding};
use crate::types::core::{Blob, CollectionKey};
use crate::types::state::StableState;
use shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use std::borrow::Cow;

/// Assets

pub fn get_public_asset(full_path: &FullPath) -> (Option<Asset>, Memory) {
    // We cannot know on the web which memory has been used. That's why we try first to get the asset from heap for performance reason.
    let heap_asset =
        STATE.with(|state| get_asset_heap(full_path, &state.borrow().heap.storage.assets));

    match heap_asset {
        Some(heap_asset) => (Some(heap_asset), Memory::Heap),
        None => {
            STATE.with(|state| get_public_asset_stable(full_path, &state.borrow().stable.assets))
        }
    }
}

pub fn get_public_asset_stable(
    full_path: &FullPath,
    assets: &AssetsStable,
) -> (Option<Asset>, Memory) {
    // full_path examples:
    // /index.html
    // /images/hello.png
    let parts: Vec<&str> = full_path.split('/').collect();

    // The satellite does not use stable memory for the #app collection, so we can assume that a requested stable asset is one uploaded by a user or developer.
    // Therefore, it should be prefixed with the collection (/collection/something)

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
        Memory::Heap => Some(encoding.content_chunks[chunk_index].clone()),
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

fn insert_asset_encoding_stable(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
    chunks: &mut ContentChunksStable,
) {
    let mut content_chunks = Vec::new();

    // Insert each chunk into the StableBTreeMap
    for (i, chunk) in encoding.content_chunks.iter().enumerate() {
        let key = stable_encoding_chunk_key(full_path, encoding_type, i);

        chunks.insert(key.clone(), chunk.clone());

        content_chunks.push(serialize_to_bytes(&key).into_owned());
    }

    // Insert the encoding by replacing the chunks with their referenced keys serialized
    asset.encodings.insert(
        encoding_type.to_owned(),
        AssetEncoding {
            content_chunks,
            ..encoding.clone()
        },
    );
}

fn insert_asset_heap(full_path: &FullPath, asset: &Asset, assets: &mut AssetsHeap) {
    assets.insert(full_path.clone(), asset.clone());
}

// List

pub fn get_assets_stable(
    collection: &CollectionKey,
    assets: &AssetsStable,
) -> Vec<(StableKey, Asset)> {
    let start_key = StableKey {
        collection: collection.clone(),
        full_path: "".to_string(),
    };

    let end_key = StableKey {
        collection: range_collection_end(collection).clone(),
        full_path: "".to_string(),
    };

    assets.range(start_key..end_key).collect()
}

pub fn get_assets_heap<'a>(
    collection: &CollectionKey,
    assets: &'a AssetsHeap,
) -> Vec<(&'a FullPath, &'a Asset)> {
    assets
        .iter()
        .filter_map(|(_, asset)| {
            if &asset.key.collection == collection {
                Some((&asset.key.full_path, asset))
            } else {
                None
            }
        })
        .collect()
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

/// Rules

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let rules = &state.borrow().heap.storage.rules.clone();
        let rule = rules.get(collection);

        rule.cloned()
    });

    match rule {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(rule) => Ok(rule),
    }
}

/// Custom domains

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

///
/// Config
///

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.storage.config.clone())
}

pub fn insert_config(config: &StorageConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn insert_config_impl(config: &StorageConfig, state: &mut StorageHeapState) {
    state.config = config.clone();
}

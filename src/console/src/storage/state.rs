use crate::storage::types::state::{
    AssetsHeap, BatchAssetsStable, BatchContentChunksStable, BatchStableEncodingChunkKey,
    BatchStableKey, StorageHeapState,
};
use crate::STATE;
use junobuild_collections::msg::COLLECTION_NOT_FOUND;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::serializers::serialize_to_bytes;
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{BatchId, FullPath};
use junobuild_storage::types::store::{Asset, AssetEncoding};

pub fn get_batch_asset(
    batch_id: &BatchId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    STATE.with(|state| {
        get_batch_asset_impl(
            batch_id,
            collection,
            full_path,
            &state.borrow().stable.batch_assets,
        )
    })
}

fn get_batch_asset_impl(
    batch_id: &BatchId,
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &BatchAssetsStable,
) -> Option<Asset> {
    assets.get(&stable_key(batch_id, collection, full_path))
}

pub fn insert_batch_asset_encoding(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    STATE.with(|state| {
        insert_batch_asset_encoding_impl(
            full_path,
            encoding_type,
            encoding,
            asset,
            &mut state.borrow_mut().stable.batch_content_chunks,
        )
    })
}

pub fn insert_batch_asset(
    batch_id: &BatchId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
) {
    STATE.with(|state| {
        insert_batch_asset_impl(
            batch_id,
            collection,
            full_path,
            asset,
            &mut state.borrow_mut().stable.batch_assets,
        )
    })
}

fn insert_batch_asset_impl(
    batch_id: &BatchId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut BatchAssetsStable,
) {
    assets.insert(stable_key(batch_id, collection, full_path), asset.clone());
}

fn stable_key(
    batch_id: &BatchId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> BatchStableKey {
    BatchStableKey {
        batch_id: *batch_id,
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

// TODO: duplicates Satellite insert_asset_encoding_stable
fn insert_batch_asset_encoding_impl(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
    chunks: &mut BatchContentChunksStable,
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

fn stable_encoding_chunk_key(
    full_path: &FullPath,
    encoding_type: &str,
    chunk_index: usize,
) -> BatchStableEncodingChunkKey {
    BatchStableEncodingChunkKey {
        full_path: full_path.clone(),
        encoding_type: encoding_type.to_owned(),
        chunk_index,
    }
}

pub fn get_asset(full_path: &FullPath) -> Option<Asset> {
    STATE.with(|state| get_asset_impl(full_path, &state.borrow().heap.get_storage().assets))
}

fn get_asset_impl(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

pub fn get_content_chunks(encoding: &AssetEncoding, chunk_index: usize) -> Option<Blob> {
    Some(encoding.content_chunks[chunk_index].clone())
}

/// Rules

// TODO: almost same as satellite except get_storage()

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let rules = &state.borrow().heap.get_storage().rules.clone();
        let rule = rules.get(collection);

        rule.cloned()
    });

    match rule {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(rule) => Ok(rule),
    }
}

///
/// Config
///

// TODO: almost same as satellite except get_storage()

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.get_storage().config.clone())
}

pub fn insert_config(config: &StorageConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn insert_config_impl(config: &StorageConfig, state: &mut Option<StorageHeapState>) {
    match state {
        Some(state) => {
            state.config = config.clone();
        }
        None => {
            *state = Some(StorageHeapState {
                config: config.clone(),
                ..Default::default()
            });
        }
    }
}

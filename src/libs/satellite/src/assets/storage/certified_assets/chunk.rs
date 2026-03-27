use crate::assets::storage::strategy_impls::StorageState;
use crate::assets::storage::types::state::StableKey;
use crate::certification::strategy_impls::StorageCertificate;
use crate::memory::state::STATE;
use crate::types::state::State;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::store::AssetKey;
use std::ops::Bound;
use junobuild_storage::types::interface::CertifyAssetsCursor;
use crate::types::interface::{CertifyAssetsArgs, CertifyAssetsResult};

const DEFAULT_CHUNK_SIZE: usize = 1000;

pub fn certify_assets_chunk(args: CertifyAssetsArgs) -> CertifyAssetsResult {
    STATE.with(|state| certify_assets_chunk_impl(&state.borrow(), args))
}

fn certify_assets_chunk_impl(state: &State, args: CertifyAssetsArgs) -> CertifyAssetsResult {
    let config = &state.heap.storage.config;

    let chunk_size = args
        .chunk_size
        .map(|s| usize::try_from(s).unwrap_or(DEFAULT_CHUNK_SIZE))
        .unwrap_or(DEFAULT_CHUNK_SIZE);

    let next_cursor = match args.cursor {
        CertifyAssetsCursor::Heap { offset } => {
            junobuild_storage::certified_assets::certify_assets_chunk(
                args.strategy,
                config,
                &StorageState,
                &StorageCertificate,
                |asset_hashes| {
                    process_heap_chunk(state, asset_hashes, config, offset, chunk_size)
                },
            )
        }
        CertifyAssetsCursor::Stable { key } => {
            junobuild_storage::certified_assets::certify_assets_chunk(
                args.strategy,
                config,
                &StorageState,
                &StorageCertificate,
                |asset_hashes| {
                    process_stable_chunk(state, asset_hashes, config, key, chunk_size)
                },
            )
        }
    };

    CertifyAssetsResult { next_cursor }
}

fn process_heap_chunk(
    state: &State,
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    offset: usize,
    chunk_size: usize,
) -> Option<CertifyAssetsCursor> {
    let mut count = 0;

    for asset in state
        .heap
        .storage
        .assets
        .values()
        .skip(offset)
        .take(chunk_size)
    {
        asset_hashes.insert(asset, config);
        count += 1;
    }

    if count == chunk_size {
        Some(CertifyAssetsCursor::Heap {
            offset: offset + chunk_size,
        })
    } else {
        None
    }
}

fn process_stable_chunk(
    state: &State,
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    from_key: Option<AssetKey>,
    chunk_size: usize,
) -> Option<CertifyAssetsCursor> {
    let mut count = 0;

    let stable_key = from_key.map(|key| StableKey {
        collection: key.collection,
        full_path: key.full_path,
    });

    let iter = match &stable_key {
        None => state.stable.assets.iter(),
        Some(key) => state.stable.assets.range((Bound::Excluded(key.clone()), Bound::Unbounded)),
    };

    let mut last_key: Option<AssetKey> = None;

    for entry in iter.take(chunk_size) {
        let asset = entry.value();
        asset_hashes.insert(&asset, config);
        count += 1;

        if count == chunk_size {
            last_key = Some(asset.key);
        }
    }

    if count == chunk_size {
        Some(CertifyAssetsCursor::Stable { key: last_key })
    } else {
        None
    }
}
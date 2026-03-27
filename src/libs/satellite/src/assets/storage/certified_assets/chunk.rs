use crate::assets::storage::certified_assets::types::CertifyAssetsCursor;
use crate::assets::storage::strategy_impls::StorageState;
use crate::assets::storage::types::state::StableKey;
use crate::certification::strategy_impls::StorageCertificate;
use crate::memory::state::STATE;
use crate::types::interface::{CertifyAssetsArgs, CertifyAssetsResult};
use crate::types::state::State;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::store::AssetKey;

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

    let (mut asset_hashes, next_cursor) = match args.cursor {
        CertifyAssetsCursor::Heap { offset } => {
            process_heap_chunk(state, config, offset, chunk_size)
        }
        CertifyAssetsCursor::Stable { key } => process_stable_chunk(state, config, key, chunk_size),
    };

    extend_and_init_certified_assets(
        &mut asset_hashes,
        config,
        &StorageState,
        &StorageCertificate,
    );

    CertifyAssetsResult { next_cursor }
}

type ProcessChunkResult = (CertifiedAssetHashes, Option<CertifyAssetsCursor>);

fn process_heap_chunk(
    state: &State,
    config: &StorageConfig,
    offset: usize,
    chunk_size: usize,
) -> ProcessChunkResult {
    let mut asset_hashes = CertifiedAssetHashes::default();
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

    let next_cursor = if count == chunk_size {
        Some(CertifyAssetsCursor::Heap {
            offset: offset + chunk_size,
        })
    } else {
        None
    };

    (asset_hashes, next_cursor)
}

fn process_stable_chunk(
    state: &State,
    config: &StorageConfig,
    from_key: Option<AssetKey>,
    chunk_size: usize,
) -> ProcessChunkResult {
    let mut asset_hashes = CertifiedAssetHashes::default();
    let mut count = 0;

    let stable_key = from_key.map(|key| StableKey {
        collection: key.collection,
        full_path: key.full_path,
    });

    let iter = match &stable_key {
        None => state.stable.assets.iter(),
        Some(key) => state.stable.assets.iter_from_prev_key(key),
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

    let next_cursor = if count == chunk_size {
        Some(CertifyAssetsCursor::Stable { key: last_key })
    } else {
        None
    };

    (asset_hashes, next_cursor)
}

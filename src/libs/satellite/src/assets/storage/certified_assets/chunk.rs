use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;
use junobuild_storage::types::config::StorageConfig;
use crate::assets::storage::strategy_impls::StorageState;
use crate::assets::storage::types::state::StableKey;
use crate::certification::strategy_impls::StorageCertificate;
use crate::memory::state::STATE;
use crate::types::state::State;

pub struct InitCertifiedAssetsArgs {
    pub cursor: InitCertifiedAssetsCursor,
}

pub enum InitCertifiedAssetsCursor {
    Heap { offset: usize },
    Stable { key: Option<StableKey> },
}

pub struct InitCertifiedAssetsResult {
    pub next_cursor: Option<InitCertifiedAssetsCursor>,
}

pub fn certify_assets_chunk(args: InitCertifiedAssetsArgs) -> InitCertifiedAssetsResult {
    STATE.with(|state| {
        certify_assets_chunk_impl(&state.borrow(), args)
    })
}

fn certify_assets_chunk_impl(
    state: &State,
    args: InitCertifiedAssetsArgs,
) -> InitCertifiedAssetsResult {
    let mut asset_hashes = CertifiedAssetHashes::default();

    let config = &state.heap.storage.config;

    let next_cursor = match args.cursor {
        InitCertifiedAssetsCursor::Heap { offset } => {
            process_heap_chunk(state, &mut asset_hashes, config, offset)
        }
        InitCertifiedAssetsCursor::Stable { key } => {
            process_stable_chunk(state, &mut asset_hashes, config, key)
        }
    };

    extend_and_init_certified_assets(
        &mut asset_hashes,
        config,
        &StorageState,
        &StorageCertificate,
    );

    InitCertifiedAssetsResult { next_cursor }
}

const CHUNK_SIZE: usize = 1000;

fn process_heap_chunk(
    state: &State,
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    offset: usize,
) -> Option<InitCertifiedAssetsCursor> {
    let mut count = 0;

    for asset in state.heap.storage.assets.values().skip(offset).take(CHUNK_SIZE) {
        asset_hashes.insert(asset, config);
        count += 1;
    }

    if count == CHUNK_SIZE {
        Some(InitCertifiedAssetsCursor::Heap { offset: offset + CHUNK_SIZE })
    } else {
        None
    }
}

fn process_stable_chunk(
    state: &State,
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    from_key: Option<StableKey>,
) -> Option<InitCertifiedAssetsCursor> {
    let iter = match &from_key {
        None => state.stable.assets.iter(),
        Some(key) => state.stable.assets.iter_from_prev_key(key),
    };

    let mut last_key: Option<StableKey> = None;

    let mut count = 0;

    for entry in iter.take(CHUNK_SIZE) {
        asset_hashes.insert(&entry.value(), config);
        count += 1;

        if count == CHUNK_SIZE {
            last_key = Some(entry.key().clone());
        }
    }

    if count == CHUNK_SIZE {
        Some(InitCertifiedAssetsCursor::Stable { key: last_key })
    } else {
        None
    }
}
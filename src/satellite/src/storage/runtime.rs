use crate::memory::STATE;
use crate::storage::certification::cert::update_certified_data;
use crate::storage::certification::types::certified::CertifiedAssetHashes;
use crate::storage::rewrites::rewrite_source_to_path;
use crate::storage::routing::get_routing;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::http_request::{Routing, RoutingDefault};
use crate::storage::types::state::{Batches, Chunks, StorageRuntimeState};
use crate::storage::types::store::{Asset, Batch, Chunk};
use crate::types::state::{RuntimeState, State};
use ic_cdk::api::time;

/// Certified assets

pub fn init_certified_assets() {
    fn init_asset_hashes(state: &State) -> CertifiedAssetHashes {
        let mut asset_hashes = CertifiedAssetHashes::default();

        let config = &state.heap.storage.config;

        for (_key, asset) in state.heap.storage.assets.iter() {
            asset_hashes.insert(asset, config);
        }

        for (_key, asset) in state.stable.assets.iter() {
            asset_hashes.insert(&asset, config);
        }

        for (source, destination) in state.heap.storage.config.rewrites.clone() {
            if let Ok(routing) = get_routing(destination, false) {
                match routing {
                    Routing::Default(RoutingDefault { url: _, asset }) => {
                        let src_path = rewrite_source_to_path(&source);

                        if let Some((asset, _)) = asset {
                            asset_hashes.insert_rewrite_v2(&src_path, &asset, config);
                        }
                    }
                    Routing::Rewrite(_) => (),
                    Routing::Redirect(_) => (),
                }
            }
        }

        for (source, redirect) in state.heap.storage.config.unwrap_redirects() {
            asset_hashes.insert_redirect_v2(
                &source,
                redirect.status_code,
                &redirect.location,
                &config.unwrap_iframe(),
            );
        }

        asset_hashes
    }

    let asset_hashes = STATE.with(|state| init_asset_hashes(&state.borrow()));

    STATE.with(|state| {
        init_certified_assets_impl(&asset_hashes, &mut state.borrow_mut().runtime.storage)
    });
}

pub fn update_certified_asset(asset: &Asset, config: &StorageConfig) {
    STATE.with(|state| update_certified_asset_impl(asset, config, &mut state.borrow_mut().runtime));
}

pub fn delete_certified_asset(asset: &Asset) {
    STATE.with(|state| delete_certified_asset_impl(asset, &mut state.borrow_mut().runtime));
}

fn init_certified_assets_impl(
    asset_hashes: &CertifiedAssetHashes,
    storage: &mut StorageRuntimeState,
) {
    // 1. Init all asset in tree
    storage.asset_hashes = asset_hashes.clone();

    // 2. Update the root hash and the canister certified data
    update_certified_data(&storage.asset_hashes);
}

fn update_certified_asset_impl(asset: &Asset, config: &StorageConfig, runtime: &mut RuntimeState) {
    // 1. Replace or insert the new asset in tree
    runtime.storage.asset_hashes.insert(asset, config);

    // 2. Update the root hash and the canister certified data
    update_certified_data(&runtime.storage.asset_hashes);
}

fn delete_certified_asset_impl(asset: &Asset, runtime: &mut RuntimeState) {
    // 1. Remove the asset in tree
    runtime.storage.asset_hashes.delete(asset);

    // 2. Update the root hash and the canister certified data
    update_certified_data(&runtime.storage.asset_hashes);
}

/// Batch

pub fn get_batch(batch_id: &u128) -> Option<Batch> {
    STATE.with(|state| {
        let batches = state.borrow().runtime.storage.batches.clone();
        let batch = batches.get(batch_id);
        batch.cloned()
    })
}

pub fn insert_batch(batch_id: &u128, batch: Batch) {
    STATE.with(|state| {
        insert_batch_impl(
            batch_id,
            batch,
            &mut state.borrow_mut().runtime.storage.batches,
        )
    })
}

pub fn clear_expired_batches() {
    STATE.with(|state| clear_expired_batches_impl(&mut state.borrow_mut().runtime.storage.batches));
}

pub fn clear_batch(batch_id: &u128, chunk_ids: &[u128]) {
    STATE.with(|state| {
        clear_batch_impl(batch_id, chunk_ids, &mut state.borrow_mut().runtime.storage)
    });
}

fn insert_batch_impl(batch_id: &u128, batch: Batch, batches: &mut Batches) {
    batches.insert(*batch_id, batch);
}

fn clear_expired_batches_impl(batches: &mut Batches) {
    let now = time();

    let clone_batches = batches.clone();

    for (batch_id, batch) in clone_batches.iter() {
        if now > batch.expires_at {
            batches.remove(batch_id);
        }
    }
}

fn clear_batch_impl(batch_id: &u128, chunk_ids: &[u128], state: &mut StorageRuntimeState) {
    for chunk_id in chunk_ids.iter() {
        state.chunks.remove(chunk_id);
    }

    state.batches.remove(batch_id);
}

/// Chunks

pub fn get_chunk(chunk_id: &u128) -> Option<Chunk> {
    STATE.with(|state| {
        let chunks = state.borrow().runtime.storage.chunks.clone();
        let chunk = chunks.get(chunk_id);
        chunk.cloned()
    })
}

pub fn clear_expired_chunks() {
    STATE.with(|state| clear_expired_chunks_impl(&mut state.borrow_mut().runtime.storage));
}

pub fn insert_chunk(chunk_id: &u128, chunk: Chunk) {
    STATE.with(|state| {
        insert_chunk_impl(
            chunk_id,
            chunk,
            &mut state.borrow_mut().runtime.storage.chunks,
        )
    })
}

fn clear_expired_chunks_impl(state: &mut StorageRuntimeState) {
    let cloned_chunks = state.chunks.clone();

    for (chunk_id, chunk) in cloned_chunks.iter() {
        if state.batches.get(&chunk.batch_id).is_none() {
            state.chunks.remove(chunk_id);
        }
    }
}

fn insert_chunk_impl(chunk_id: &u128, chunk: Chunk, chunks: &mut Chunks) {
    chunks.insert(*chunk_id, chunk);
}

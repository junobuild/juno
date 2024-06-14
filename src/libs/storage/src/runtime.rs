use crate::certification::cert::update_certified_data;
use crate::certification::types::certified::CertifiedAssetHashes;
use crate::memory::STATE;
use crate::types::config::StorageConfig;
use crate::types::runtime_state::{
    BatchId, Batches, ChunkId, Chunks, RuntimeState, StorageRuntimeState,
};
use crate::types::store::{Asset, Batch, Chunk};
use ic_cdk::api::time;

/// Certified assets

pub fn init_certified_assets(asset_hashes: &CertifiedAssetHashes) {
    STATE.with(|state| {
        init_certified_assets_impl(asset_hashes, &mut state.borrow_mut().runtime.storage)
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

pub fn get_batch(batch_id: &BatchId) -> Option<Batch> {
    STATE.with(|state| {
        let batches = state.borrow().runtime.storage.batches.clone();
        let batch = batches.get(batch_id);
        batch.cloned()
    })
}

pub fn insert_batch(batch_id: &BatchId, batch: Batch) {
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

pub fn clear_batch(batch_id: &BatchId, chunk_ids: &[ChunkId]) {
    STATE.with(|state| {
        clear_batch_impl(batch_id, chunk_ids, &mut state.borrow_mut().runtime.storage)
    });
}

fn insert_batch_impl(batch_id: &BatchId, batch: Batch, batches: &mut Batches) {
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

fn clear_batch_impl(batch_id: &BatchId, chunk_ids: &[ChunkId], state: &mut StorageRuntimeState) {
    for chunk_id in chunk_ids.iter() {
        state.chunks.remove(chunk_id);
    }

    state.batches.remove(batch_id);
}

/// Chunks

pub fn get_chunk(chunk_id: &ChunkId) -> Option<Chunk> {
    STATE.with(|state| {
        let chunks = state.borrow().runtime.storage.chunks.clone();
        let chunk = chunks.get(chunk_id);
        chunk.cloned()
    })
}

pub fn clear_expired_chunks() {
    STATE.with(|state| clear_expired_chunks_impl(&mut state.borrow_mut().runtime.storage));
}

pub fn insert_chunk(chunk_id: &ChunkId, chunk: Chunk) {
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

fn insert_chunk_impl(chunk_id: &ChunkId, chunk: Chunk, chunks: &mut Chunks) {
    chunks.insert(*chunk_id, chunk);
}

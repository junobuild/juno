use crate::certification::types::certified::CertifiedAssetHashes;
use crate::memory::STATE;
use crate::strategies::StorageCertificateStrategy;
use crate::types::config::StorageConfig;
use crate::types::runtime_state::{
    BatchId, Batches, ChunkId, Chunks, RuntimeState, StorageRuntimeState,
};
use crate::types::store::{Asset, Batch, BatchExpiry, Chunk};
use ic_cdk::api::time;
use ic_certification::Hash;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::rate::utils::increment_and_assert_rate_store;
use std::collections::HashMap;

// ---------------------------------------------------------
// Certified assets
// ---------------------------------------------------------

pub fn init_certified_assets(
    asset_hashes: &CertifiedAssetHashes,
    certificate: &impl StorageCertificateStrategy,
) {
    // 1. Init all asset in tree
    STATE.with(|state| {
        init_certified_assets_impl(asset_hashes, &mut state.borrow_mut().runtime.storage)
    });

    // 2. Update the root hash and the canister certified data
    certificate.update_certified_data();
}

pub fn update_certified_asset(
    asset: &Asset,
    config: &StorageConfig,
    certificate: &impl StorageCertificateStrategy,
) {
    // 1. Replace or insert the new asset in tree
    STATE.with(|state| update_certified_asset_impl(asset, config, &mut state.borrow_mut().runtime));

    // 2. Update the root hash and the canister certified data
    certificate.update_certified_data();
}

pub fn delete_certified_asset(asset: &Asset, certificate: &impl StorageCertificateStrategy) {
    // 1. Remove the asset in tree
    STATE.with(|state| delete_certified_asset_impl(asset, &mut state.borrow_mut().runtime));

    // 2. Update the root hash and the canister certified data
    certificate.update_certified_data();
}

pub fn certified_assets_root_hash() -> Hash {
    STATE.with(|state| certified_assets_root_hash_impl(&state.borrow().runtime.storage))
}

fn init_certified_assets_impl(
    asset_hashes: &CertifiedAssetHashes,
    storage: &mut StorageRuntimeState,
) {
    storage.asset_hashes = asset_hashes.clone();
}

fn update_certified_asset_impl(asset: &Asset, config: &StorageConfig, runtime: &mut RuntimeState) {
    runtime.storage.asset_hashes.insert(asset, config);
}

fn delete_certified_asset_impl(asset: &Asset, runtime: &mut RuntimeState) {
    runtime.storage.asset_hashes.delete(asset);
}

fn certified_assets_root_hash_impl(storage: &StorageRuntimeState) -> Hash {
    storage.asset_hashes.root_hash()
}

// ---------------------------------------------------------
// Batch
// ---------------------------------------------------------

pub fn get_batch(batch_id: &BatchId) -> Option<Batch> {
    STATE.with(|state| {
        state
            .borrow()
            .runtime
            .storage
            .batches
            .get(batch_id)
            .cloned()
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
    clear_expired_items(batches);
}

fn clear_expired_items<K, V>(batches: &mut HashMap<K, V>)
where
    K: Clone + Eq + std::hash::Hash,
    V: BatchExpiry,
{
    let now = time();

    let expired_ids: Vec<K> = batches
        .iter()
        .filter_map(|(id, item)| {
            if now > item.expires_at() {
                Some(id.clone())
            } else {
                None
            }
        })
        .collect();

    for id in expired_ids {
        batches.remove(&id);
    }
}

fn clear_batch_impl(batch_id: &BatchId, chunk_ids: &[ChunkId], state: &mut StorageRuntimeState) {
    for chunk_id in chunk_ids.iter() {
        state.chunks.remove(chunk_id);
    }

    state.batches.remove(batch_id);
}

// ---------------------------------------------------------
// Chunks
// ---------------------------------------------------------

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
        if !state.batches.contains_key(&chunk.batch_id) {
            state.chunks.remove(chunk_id);
        }
    }
}

fn insert_chunk_impl(chunk_id: &ChunkId, chunk: Chunk, chunks: &mut Chunks) {
    chunks.insert(*chunk_id, chunk);
}

// ---------------------------------------------------------
// Rates
// ---------------------------------------------------------

pub fn increment_and_assert_rate(
    collection: &CollectionKey,
    config: &Option<RateConfig>,
) -> Result<(), String> {
    STATE.with(|state| {
        increment_and_assert_rate_store(
            collection,
            config,
            &mut state.borrow_mut().runtime.storage.rate_tokens,
        )
    })
}

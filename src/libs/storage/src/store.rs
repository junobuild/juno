use crate::assert::{
    assert_commit_batch, assert_commit_chunks, assert_commit_chunks_new_asset,
    assert_commit_chunks_update, assert_create_batch, assert_create_chunk,
};
use crate::constants::{ASSET_ENCODING_NO_COMPRESSION, ENCODING_CERTIFICATION_ORDER};
use crate::errors::JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH;
use crate::runtime::{
    clear_batch as clear_runtime_batch, clear_expired_batches as clear_expired_runtime_batches,
    clear_expired_chunks as clear_expired_runtime_chunks, get_batch as get_runtime_batch,
    get_chunk as get_runtime_chunk, insert_batch as insert_runtime_batch,
    insert_chunk as insert_runtime_chunk,
};
use crate::strategies::{StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy};
use crate::types::config::StorageConfig;
use crate::types::interface::{CommitBatch, InitAssetKey, UploadChunk};
use crate::types::runtime_state::{BatchId, ChunkId};
use crate::types::store::{
    Asset, AssetEncoding, AssetKey, Batch, Chunk, EncodingType, ReferenceId,
};
use candid::Principal;
use ic_cdk::api::time;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::state::Controllers;
use std::ptr::addr_of;

// ---------------------------------------------------------
// Upload batch and chunks
// ---------------------------------------------------------

const BATCH_EXPIRY_NANOS: u64 = 300_000_000_000;

static mut NEXT_BATCH_ID: BatchId = 0;
static mut NEXT_CHUNK_ID: ChunkId = 0;

pub fn create_batch(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    init: InitAssetKey,
    reference_id: Option<ReferenceId>,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
) -> Result<BatchId, String> {
    assert_create_batch(
        caller,
        controllers,
        config,
        &init,
        assertions,
        storage_state,
    )?;

    // Assert supported encoding type
    get_encoding_type(&init.encoding_type)?;

    Ok(create_batch_impl(caller, init, reference_id))
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
    reference_id: Option<ReferenceId>,
) -> BatchId {
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
            &*addr_of!(NEXT_BATCH_ID),
            Batch {
                key,
                reference_id,
                expires_at: now + BATCH_EXPIRY_NANOS,
                encoding_type,
            },
        );

        NEXT_BATCH_ID
    }
}

pub fn create_chunk(
    caller: Principal,
    config: &StorageConfig,
    UploadChunk {
        batch_id,
        content,
        order_id,
    }: UploadChunk,
) -> Result<ChunkId, String> {
    let batch = get_runtime_batch(&batch_id);

    match batch {
        None => Err("Batch not found.".to_string()),
        Some(b) => {
            assert_create_chunk(caller, config, &b)?;

            let now = time();

            // Update batch to extend expires_at
            insert_runtime_batch(
                &batch_id,
                Batch {
                    expires_at: now + BATCH_EXPIRY_NANOS,
                    ..b
                },
            );

            unsafe {
                NEXT_CHUNK_ID += 1;

                insert_runtime_chunk(
                    &*addr_of!(NEXT_CHUNK_ID),
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

pub fn commit_batch(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    commit_batch: CommitBatch,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    let batch = get_runtime_batch(&commit_batch.batch_id);

    match batch {
        None => Err(JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH.to_string()),
        Some(b) => {
            let asset = secure_commit_chunks(
                caller,
                controllers,
                config,
                commit_batch,
                &b,
                assertions,
                storage_state,
                storage_upload,
            )?;
            Ok(asset)
        }
    }
}

#[allow(clippy::too_many_arguments)]
fn secure_commit_chunks(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    commit_batch: CommitBatch,
    batch: &Batch,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    let rule = assert_commit_batch(caller, controllers, batch, assertions, storage_state)?;

    let current = storage_upload.get_asset(
        &batch.reference_id,
        &batch.key.collection,
        &batch.key.full_path,
        &rule,
    )?;

    match current {
        None => {
            assert_commit_chunks_new_asset(caller, &batch.key.collection, controllers, config, &rule, assertions)?;

            commit_chunks(
                caller,
                controllers,
                commit_batch,
                batch,
                &rule,
                &None,
                assertions,
                storage_upload,
            )
        }
        Some(current) => secure_commit_chunks_update(
            caller,
            controllers,
            config,
            commit_batch,
            batch,
            rule,
            current,
            assertions,
            storage_upload,
        ),
    }
}

#[allow(clippy::too_many_arguments)]
fn secure_commit_chunks_update(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    commit_batch: CommitBatch,
    batch: &Batch,
    rule: Rule,
    current: Asset,
    assertions: &impl StorageAssertionsStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    assert_commit_chunks_update(
        caller,
        controllers,
        config,
        batch,
        &rule,
        &current,
        assertions,
    )?;

    commit_chunks(
        caller,
        controllers,
        commit_batch,
        batch,
        &rule,
        &Some(current),
        assertions,
        storage_upload,
    )
}

#[allow(clippy::too_many_arguments)]
fn commit_chunks(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
    rule: &Rule,
    current: &Option<Asset>,
    assertions: &impl StorageAssertionsStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    let now = time();

    if now > batch.expires_at {
        clear_expired_batches();
        return Err("Batch did not complete in time. Chunks cannot be committed.".to_string());
    }

    assert_commit_chunks(
        caller,
        controllers,
        &commit_batch,
        batch,
        current,
        rule,
        assertions,
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

    let mut asset: Asset = Asset::prepare(key, headers, current);

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

    storage_upload.insert_asset_encoding(
        &batch.clone().key.full_path,
        &encoding_type,
        &encoding,
        &mut asset,
        rule,
    );

    storage_upload.insert_asset(batch, &asset, rule)?;

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

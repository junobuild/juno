use crate::constants::{
    ASSET_ENCODING_NO_COMPRESSION, ENCODING_CERTIFICATION_ORDER, WELL_KNOWN_CUSTOM_DOMAINS,
    WELL_KNOWN_II_ALTERNATIVE_ORIGINS,
};
use crate::msg::{ERROR_CANNOT_COMMIT_BATCH, UPLOAD_NOT_ALLOWED};
use crate::runtime::{
    clear_batch as clear_runtime_batch, clear_expired_batches as clear_expired_runtime_batches,
    clear_expired_chunks as clear_expired_runtime_chunks, get_batch as get_runtime_batch,
    get_chunk as get_runtime_chunk, insert_batch as insert_runtime_batch,
    insert_chunk as insert_runtime_chunk,
};
use crate::strategies::{StorageAssertionsStrategy, StorageStateStrategy, StorageUploadStrategy};
use crate::types::interface::{CommitBatch, InitAssetKey, UploadChunk};
use crate::types::runtime_state::{BatchId, ChunkId};
use crate::types::state::FullPath;
use crate::types::store::{
    Asset, AssetAssertUpload, AssetEncoding, AssetKey, Batch, Chunk, EncodingType, ReferenceId,
};
use candid::Principal;
use ic_cdk::api::time;
use junobuild_collections::assert_stores::{assert_create_permission, assert_permission};
use junobuild_collections::constants::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::assert::assert_description_length;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::principal_not_equal;
use std::collections::HashMap;

///
/// Upload batch and chunks
///

const BATCH_EXPIRY_NANOS: u64 = 300_000_000_000;

static mut NEXT_BATCH_ID: BatchId = 0;
static mut NEXT_CHUNK_ID: ChunkId = 0;

pub fn create_batch(
    caller: Principal,
    controllers: &Controllers,
    init: InitAssetKey,
    reference_id: Option<ReferenceId>,
) -> Result<BatchId, String> {
    assert_key(caller, &init.full_path, &init.collection, controllers)?;

    assert_description_length(&init.description)?;

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
            &NEXT_BATCH_ID,
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
    UploadChunk {
        batch_id,
        content,
        order_id,
    }: UploadChunk,
) -> Result<ChunkId, &'static str> {
    let batch = get_runtime_batch(&batch_id);

    match batch {
        None => Err("Batch not found."),
        Some(b) => {
            if principal_not_equal(caller, b.key.owner) {
                return Err("Bach initializer does not match chunk uploader.");
            }

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
                    &NEXT_CHUNK_ID,
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
    commit_batch: CommitBatch,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    let batch = get_runtime_batch(&commit_batch.batch_id);

    match batch {
        None => Err(ERROR_CANNOT_COMMIT_BATCH.to_string()),
        Some(b) => {
            let asset = secure_commit_chunks(
                caller,
                controllers,
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

fn assert_key(
    caller: Principal,
    full_path: &FullPath,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> Result<(), &'static str> {
    // /.well-known/ic-domains is automatically generated for custom domains
    assert_well_known_key(full_path, WELL_KNOWN_CUSTOM_DOMAINS)?;

    // /.well-known/ii-alternative-origins is automatically generated for alternative origins
    assert_well_known_key(full_path, WELL_KNOWN_II_ALTERNATIVE_ORIGINS)?;

    let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;

    // Only controllers can write in collection #dapp
    if collection.clone() == *dapp_collection && !is_controller(caller, controllers) {
        return Err(UPLOAD_NOT_ALLOWED);
    }

    // Asset uploaded by users should be prefixed with the collection. That way developers can organize assets to particular folders.
    if collection.clone() != *dapp_collection
        && !full_path.starts_with(&["/", collection, "/"].join(""))
    {
        return Err("Asset path must be prefixed with collection key.");
    }

    Ok(())
}

fn assert_well_known_key(full_path: &str, reserved_path: &str) -> Result<(), &'static str> {
    if full_path == reserved_path {
        let error = format!("{} is a reserved asset.", reserved_path);
        return Err(Box::leak(error.into_boxed_str()));
    }
    Ok(())
}

fn secure_commit_chunks(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    // The one that started the batch should be the one that commits it
    if principal_not_equal(caller, batch.key.owner) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_key(
        caller,
        &batch.key.full_path,
        &batch.key.collection,
        controllers,
    )?;

    let rule = storage_state.get_rule(&batch.key.collection)?;

    let current = storage_upload.get_asset(
        &commit_batch.batch_id,
        &batch.key.collection,
        &batch.key.full_path,
        &rule,
    );

    match current {
        None => {
            if !assert_create_permission(&rule.write, caller, controllers) {
                return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
            }

            commit_chunks(
                caller,
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
    commit_batch: CommitBatch,
    batch: &Batch,
    rule: Rule,
    current: Asset,
    assertions: &impl StorageAssertionsStrategy,
    storage_upload: &impl StorageUploadStrategy,
) -> Result<Asset, String> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err("Provided collection does not match existing collection.".to_string());
    }

    if !assert_permission(&rule.write, current.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    commit_chunks(
        caller,
        commit_batch,
        batch,
        &rule,
        &Some(current),
        assertions,
        storage_upload,
    )
}

fn commit_chunks(
    caller: Principal,
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

    assertions.invoke_assert_upload_asset(
        &caller,
        &AssetAssertUpload {
            current: current.clone(),
            batch: batch.clone(),
            commit_batch: commit_batch.clone(),
        },
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

    let now = time();

    let mut asset: Asset = Asset {
        key,
        headers,
        encodings: HashMap::new(),
        created_at: now,
        updated_at: now,
        version: Some(INITIAL_VERSION),
    };

    if let Some(existing_asset) = current {
        asset.encodings = existing_asset.encodings.clone();
        asset.created_at = existing_asset.created_at;
        asset.version = Some(existing_asset.version.unwrap_or_default() + 1);
    }

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

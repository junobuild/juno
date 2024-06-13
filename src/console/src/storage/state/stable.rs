use crate::storage::types::state::{
    BatchAssetsStable, BatchContentChunksStable, BatchStableEncodingChunkKey, BatchStableKey,
};
use crate::STATE;
use junobuild_shared::serializers::serialize_to_bytes;
use junobuild_shared::types::core::CollectionKey;
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

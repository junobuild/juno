use crate::proposals::ProposalId;
use crate::storage::state::types::{ProposalAssetKey, ProposalAssetsStable};
use crate::storage::{ProposalContentChunkKey, ProposalContentChunksStable};
use crate::strategies::CdnStableStrategy;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::structures::collect_stable_vec;
use junobuild_shared::types::core::Blob;
use junobuild_storage::stable_utils::insert_asset_encoding_stable;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding, BlobOrKey};
use std::borrow::Cow;
use std::ops::RangeBounds;

pub fn get_asset(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    cdn_stable.with_assets(|assets| get_asset_impl(proposal_id, collection, full_path, assets))
}

fn get_asset_impl(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &ProposalAssetsStable,
) -> Option<Asset> {
    assets.get(&proposal_asset_key(proposal_id, collection, full_path))
}

pub fn get_content_chunks(
    cdn_stable: &impl CdnStableStrategy,
    encoding: &AssetEncoding,
    chunk_index: usize,
) -> Option<Blob> {
    cdn_stable.with_content_chunks(|content_chunks| {
        get_content_chunks_impl(encoding, chunk_index, content_chunks)
    })
}

fn get_content_chunks_impl(
    encoding: &AssetEncoding,
    chunk_index: usize,
    content_chunks: &ProposalContentChunksStable,
) -> Option<Blob> {
    let key: ProposalContentChunkKey =
        deserialize_from_bytes(Cow::Owned(encoding.content_chunks[chunk_index].clone()));
    content_chunks.get(&key)
}

pub fn get_assets(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
) -> Vec<(ProposalAssetKey, Asset)> {
    cdn_stable.with_assets(|assets| get_assets_impl(proposal_id, assets))
}

fn get_assets_impl(
    proposal_id: &ProposalId,
    proposal_assets: &ProposalAssetsStable,
) -> Vec<(ProposalAssetKey, Asset)> {
    collect_stable_vec(proposal_assets.range(filter_assets_range(proposal_id)))
}

fn filter_assets_range(proposal_id: &ProposalId) -> impl RangeBounds<ProposalAssetKey> {
    let start_key = ProposalAssetKey {
        proposal_id: *proposal_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    let end_key = ProposalAssetKey {
        proposal_id: *proposal_id + 1,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    start_key..end_key
}

pub fn insert_asset_encoding(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    let stable_key_fn = {
        let proposal_id = *proposal_id;

        move |full_path: &FullPath, encoding_type: &str, chunk_index: usize| {
            proposal_encoding_chunk_key(&proposal_id, full_path, encoding_type, chunk_index)
        }
    };

    cdn_stable.with_content_chunks_mut(|content_chunks| {
        insert_asset_encoding_stable(
            full_path,
            encoding_type,
            encoding,
            asset,
            stable_key_fn,
            content_chunks,
        )
    })
}

pub fn insert_asset(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
) {
    cdn_stable.with_assets_mut(|assets| {
        insert_asset_impl(proposal_id, collection, full_path, asset, assets)
    })
}

fn insert_asset_impl(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut ProposalAssetsStable,
) {
    assets.insert(
        proposal_asset_key(proposal_id, collection, full_path),
        asset.clone(),
    );
}

pub fn delete_asset(cdn_stable: &impl CdnStableStrategy, key: &ProposalAssetKey) -> Option<Asset> {
    cdn_stable.with_assets_mut(|assets| delete_asset_impl(key, assets))
}

fn delete_asset_impl(key: &ProposalAssetKey, assets: &mut ProposalAssetsStable) -> Option<Asset> {
    assets.remove(key)
}

pub fn delete_content_chunks(
    cdn_stable: &impl CdnStableStrategy,
    content_chunks_keys: &[BlobOrKey],
) {
    cdn_stable.with_content_chunks_mut(|content_chunks| {
        delete_content_chunks_impl(content_chunks_keys, content_chunks)
    })
}

fn delete_content_chunks_impl(
    content_chunks_keys: &[BlobOrKey],
    content_chunks: &mut ProposalContentChunksStable,
) {
    for chunk in content_chunks_keys.iter() {
        let key: ProposalContentChunkKey = deserialize_from_bytes(Cow::Owned(chunk.clone()));
        content_chunks.remove(&key);
    }
}

fn proposal_asset_key(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> ProposalAssetKey {
    ProposalAssetKey {
        proposal_id: *proposal_id,
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

fn proposal_encoding_chunk_key(
    proposal_id: &ProposalId,
    full_path: &FullPath,
    encoding_type: &str,
    chunk_index: usize,
) -> ProposalContentChunkKey {
    ProposalContentChunkKey {
        proposal_id: *proposal_id,
        full_path: full_path.clone(),
        encoding_type: encoding_type.to_owned(),
        chunk_index,
    }
}

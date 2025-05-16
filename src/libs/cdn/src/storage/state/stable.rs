use crate::storage::types::state::{AssetKey, AssetsStable};
use crate::strategies::CdnStableStrategy;
use crate::types::state::ProposalId;
use crate::{ContentChunkKey, ContentChunksStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::types::core::Blob;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};
use std::borrow::Cow;

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
    assets: &AssetsStable,
) -> Option<Asset> {
    assets.get(&stable_asset_key(proposal_id, collection, full_path))
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
    content_chunks: &ContentChunksStable,
) -> Option<Blob> {
    let key: ContentChunkKey =
        deserialize_from_bytes(Cow::Owned(encoding.content_chunks[chunk_index].clone()));
    content_chunks.get(&key)
}

fn stable_asset_key(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> AssetKey {
    AssetKey {
        proposal_id: *proposal_id,
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

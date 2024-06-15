use crate::storage::types::state::{
    Proposal, ProposalAssetKey, ProposalAssetsStable, ProposalContentChunkKey,
    ProposalContentChunksStable, ProposalKey, ProposalsStable,
};
use crate::STATE;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::stable_utils::insert_proposal_asset_encoding_stable;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};
use std::borrow::Cow;
use std::ops::RangeBounds;

pub fn get_proposal(batch_group_id: &BatchGroupId) -> Option<Proposal> {
    STATE.with(|state| get_proposal_impl(batch_group_id, &state.borrow().stable.proposals))
}

pub fn get_proposal_asset(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    STATE.with(|state| {
        get_proposal_asset_impl(
            batch_group_id,
            collection,
            full_path,
            &state.borrow().stable.proposal_assets,
        )
    })
}

pub fn get_proposal_content_chunks(encoding: &AssetEncoding, chunk_index: usize) -> Option<Blob> {
    STATE.with(|state| {
        get_proposal_content_chunks_impl(
            encoding,
            chunk_index,
            &state.borrow().stable.proposal_content_chunks,
        )
    })
}

fn get_proposal_content_chunks_impl(
    encoding: &AssetEncoding,
    chunk_index: usize,
    content_chunks: &ProposalContentChunksStable,
) -> Option<Blob> {
    let key: ProposalContentChunkKey =
        deserialize_from_bytes(Cow::Owned(encoding.content_chunks[chunk_index].clone()));
    content_chunks.get(&key)
}

pub fn get_proposal_assets(batch_group_id: &BatchGroupId) -> Vec<(ProposalAssetKey, Asset)> {
    STATE.with(|state| {
        get_proposal_assets_impl(batch_group_id, &state.borrow().stable.proposal_assets)
    })
}

fn get_proposal_assets_impl(
    batch_group_id: &BatchGroupId,
    proposal_assets: &ProposalAssetsStable,
) -> Vec<(ProposalAssetKey, Asset)> {
    proposal_assets
        .range(filter_proposal_assets_range(batch_group_id))
        .collect()
}

fn filter_proposal_assets_range(
    batch_group_id: &BatchGroupId,
) -> impl RangeBounds<ProposalAssetKey> {
    let start_key = ProposalAssetKey {
        batch_group_id: *batch_group_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    let end_key = ProposalAssetKey {
        batch_group_id: *batch_group_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    start_key..end_key
}

fn get_proposal_impl(
    batch_group_id: &BatchGroupId,
    proposals: &ProposalsStable,
) -> Option<Proposal> {
    proposals.get(&stable_proposal_key(batch_group_id))
}

fn get_proposal_asset_impl(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &ProposalAssetsStable,
) -> Option<Asset> {
    assets.get(&stable_proposal_asset_key(
        batch_group_id,
        collection,
        full_path,
    ))
}

pub fn insert_proposal_asset_encoding(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    STATE.with(|state| {
        insert_proposal_asset_encoding_stable(
            full_path,
            encoding_type,
            encoding,
            asset,
            stable_proposal_encoding_chunk_key,
            &mut state.borrow_mut().stable.proposal_content_chunks,
        )
    })
}

pub fn insert_proposal_asset(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
) {
    STATE.with(|state| {
        insert_proposal_asset_impl(
            batch_group_id,
            collection,
            full_path,
            asset,
            &mut state.borrow_mut().stable.proposal_assets,
        )
    })
}

pub fn insert_proposal(batch_group_id: &BatchGroupId, proposal: &Proposal) {
    STATE.with(|state| {
        insert_proposal_impl(
            batch_group_id,
            proposal,
            &mut state.borrow_mut().stable.proposals,
        )
    })
}

fn insert_proposal_impl(
    batch_group_id: &BatchGroupId,
    proposal: &Proposal,
    proposals: &mut ProposalsStable,
) {
    proposals.insert(stable_proposal_key(batch_group_id), proposal.clone());
}

fn insert_proposal_asset_impl(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut ProposalAssetsStable,
) {
    assets.insert(
        stable_proposal_asset_key(batch_group_id, collection, full_path),
        asset.clone(),
    );
}

fn stable_proposal_key(batch_group_id: &BatchGroupId) -> ProposalKey {
    ProposalKey {
        batch_group_id: *batch_group_id,
    }
}

fn stable_proposal_asset_key(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> ProposalAssetKey {
    ProposalAssetKey {
        batch_group_id: *batch_group_id,
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

fn stable_proposal_encoding_chunk_key(
    full_path: &FullPath,
    encoding_type: &str,
    chunk_index: usize,
) -> ProposalContentChunkKey {
    ProposalContentChunkKey {
        full_path: full_path.clone(),
        encoding_type: encoding_type.to_owned(),
        chunk_index,
    }
}

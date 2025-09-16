use crate::cdn::helpers::store::init_asset_upload as init_asset_upload_store;
use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::{StorageAssertions, StorageState, StorageUpload};
use crate::guards::caller_is_admin_controller;
use crate::store::heap::get_controllers;
use ic_cdk_macros::{query, update};
use junobuild_cdn::proposals::ProposalId;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::Controllers;
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_chunk};
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use junobuild_storage::types::state::FullPath;

// ---------------------------------------------------------
// Storage
// ---------------------------------------------------------

#[deprecated(note = "Use init_proposal_many_assets_upload instead")]
#[update(guard = "caller_is_admin_controller")]
fn init_proposal_asset_upload(init: InitAssetKey, proposal_id: ProposalId) -> InitUploadResult {
    let caller = caller();

    let batch_id = init_asset_upload_store(caller, init, proposal_id).unwrap_or_trap();

    InitUploadResult { batch_id }
}

#[update(guard = "caller_is_admin_controller")]
fn init_proposal_many_assets_upload(
    init_asset_keys: Vec<InitAssetKey>,
    proposal_id: ProposalId,
) -> Vec<(FullPath, InitUploadResult)> {
    let caller = caller();

    let mut results: Vec<(FullPath, InitUploadResult)> = Vec::new();

    for init_asset_key in init_asset_keys {
        let full_path = init_asset_key.full_path.clone();

        let batch_id =
            init_asset_upload_store(caller, init_asset_key, proposal_id).unwrap_or_trap();

        results.push((full_path, InitUploadResult { batch_id }));
    }

    results
}

#[update(guard = "caller_is_admin_controller")]
fn upload_proposal_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();
    let config = junobuild_cdn::storage::heap::get_config(&CdnHeap);

    let chunk_id = create_chunk(caller, &config, chunk).unwrap_or_trap();

    UploadChunkResult { chunk_id }
}

#[deprecated(note = "Use commit_proposal_many_assets_upload instead")]
#[update(guard = "caller_is_admin_controller")]
fn commit_proposal_asset_upload(commit: CommitBatch) {
    let caller = caller();

    let controllers: Controllers = get_controllers();
    let config = junobuild_cdn::storage::heap::get_config(&CdnHeap);

    commit_batch_storage(
        caller,
        &controllers,
        &config,
        commit,
        &StorageAssertions,
        &StorageState,
        &StorageUpload,
    )
    .unwrap_or_trap();
}

#[update(guard = "caller_is_admin_controller")]
fn commit_proposal_many_assets_upload(commits: Vec<CommitBatch>) {
    let caller = caller();

    let controllers: Controllers = get_controllers();
    let config = junobuild_cdn::storage::heap::get_config(&CdnHeap);

    for commit in commits {
        commit_batch_storage(
            caller,
            &controllers,
            &config,
            commit,
            &StorageAssertions,
            &StorageState,
            &StorageUpload,
        )
        .unwrap_or_trap();
    }
}

#[query(guard = "caller_is_admin_controller")]
pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    junobuild_cdn::storage::heap::list_assets(&CdnHeap, &collection, &filter)
}

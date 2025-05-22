use crate::cdn::helpers::store::init_asset_upload as init_asset_upload_store;
use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::{StorageAssertions, StorageState, StorageUpload};
use crate::guards::caller_is_admin_controller;
use crate::store::heap::get_controllers;
use ic_cdk::api::caller;
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_cdn::proposals::ProposalId;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::Controllers;
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_chunk};
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};

// ---------------------------------------------------------
// Storage
// ---------------------------------------------------------

#[update(guard = "caller_is_admin_controller")]
fn init_proposal_asset_upload(init: InitAssetKey, proposal_id: ProposalId) -> InitUploadResult {
    let caller = caller();

    let result = init_asset_upload_store(caller, init, proposal_id);

    match result {
        Ok(batch_id) => InitUploadResult { batch_id },
        Err(error) => trap(&error),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn upload_proposal_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();
    let config = junobuild_cdn::storage::heap::get_config(&CdnHeap);

    let result = create_chunk(caller, &config, chunk);

    match result {
        Ok(chunk_id) => UploadChunkResult { chunk_id },
        Err(error) => trap(&error),
    }
}

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
    .unwrap_or_else(|e| trap(&e));
}

#[query(guard = "caller_is_admin_controller")]
pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    junobuild_cdn::storage::heap::list_assets(&CdnHeap, &collection, &filter)
}

use crate::cdn::proposals::post_commit_assets;
use crate::cdn::storage::heap::insert_asset;
use crate::cdn::storage::heap::store::delete_assets;
use crate::memory::manager::STATE;
use junobuild_cdn::proposals::{Proposal, ProposalsStable};
use junobuild_cdn::storage::{ProposalAssetsStable, ProposalContentChunksStable};
use junobuild_cdn::strategies::{
    CdnCommitAssetsStrategy, CdnHeapStrategy, CdnStableStrategy, CdnWorkflowStrategy,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Rule, Rules};
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};
use junobuild_storage::utils::insert_encoding_into_asset;

pub struct CdnHeap;

impl CdnHeapStrategy for CdnHeap {
    fn with_config<R>(&self, f: impl FnOnce(&StorageConfig) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.config)
        })
    }

    fn with_config_mut<R>(&self, f: impl FnOnce(&mut StorageConfig) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.heap.storage.config)
        })
    }

    fn with_rules<R>(&self, f: impl FnOnce(&Rules) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.rules)
        })
    }

    fn with_domains<R>(&self, f: impl FnOnce(&CustomDomains) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.custom_domains)
        })
    }

    fn with_domains_mut<R>(&self, f: impl FnOnce(&mut CustomDomains) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.heap.storage.custom_domains)
        })
    }
}

pub struct CdnStable;

impl CdnStableStrategy for CdnStable {
    fn with_assets<R>(&self, f: impl FnOnce(&ProposalAssetsStable) -> R) -> R {
        STATE.with(|state| {
            let stable = &state.borrow().stable;
            f(&stable.proposals_assets)
        })
    }

    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut ProposalAssetsStable) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.stable.proposals_assets)
        })
    }

    fn with_content_chunks<R>(&self, f: impl FnOnce(&ProposalContentChunksStable) -> R) -> R {
        STATE.with(|state| {
            let stable = &state.borrow().stable;
            f(&stable.proposals_content_chunks)
        })
    }

    fn with_content_chunks_mut<R>(
        &self,
        f: impl FnOnce(&mut ProposalContentChunksStable) -> R,
    ) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.stable.proposals_content_chunks)
        })
    }

    fn with_proposals<R>(&self, f: impl FnOnce(&ProposalsStable) -> R) -> R {
        STATE.with(|state| {
            let stable = &state.borrow().stable;
            f(&stable.proposals)
        })
    }

    fn with_proposals_mut<R>(&self, f: impl FnOnce(&mut ProposalsStable) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.stable.proposals)
        })
    }
}

pub struct CdnWorkflow;

impl CdnWorkflowStrategy for CdnWorkflow {
    fn pre_commit_assets(&self, proposal: &Proposal) -> Result<(), String> {
        junobuild_cdn::proposals::pre_commit_assets(&CdnCommitAssets, proposal)
    }

    fn post_commit_assets(&self, proposal: &Proposal) -> Result<(), String> {
        post_commit_assets(proposal)
    }
}

pub struct CdnCommitAssets;

impl CdnCommitAssetsStrategy for CdnCommitAssets {
    fn insert_asset(
        &self,
        _collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        _rule: &Rule,
    ) {
        insert_asset(full_path, asset);
    }

    fn insert_asset_encoding(
        &self,
        _full_path: &FullPath,
        encoding_type: &str,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        _rule: &Rule,
    ) {
        insert_encoding_into_asset(encoding_type, encoding, asset)
    }

    fn delete_assets(&self, collection: &CollectionKey) -> Result<(), String> {
        delete_assets(collection);

        Ok(())
    }
}

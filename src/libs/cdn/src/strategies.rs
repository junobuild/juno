use crate::proposals::{Proposal, ProposalsStable};
use crate::storage::{ProposalAssetsStable, ProposalContentChunksStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Rule, Rules};
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{AssetsHeap, FullPath};
use junobuild_storage::types::store::{Asset, AssetEncoding};

pub trait CdnHeapStrategy {
    fn with_assets<R>(&self, f: impl FnOnce(&AssetsHeap) -> R) -> R;
    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut AssetsHeap) -> R) -> R;

    fn with_config<R>(&self, f: impl FnOnce(&StorageConfig) -> R) -> R;
    fn with_config_mut<R>(&self, f: impl FnOnce(&mut StorageConfig) -> R) -> R;

    fn with_rules<R>(&self, f: impl FnOnce(&Rules) -> R) -> R;

    fn with_domains<R>(&self, f: impl FnOnce(&CustomDomains) -> R) -> R;
    fn with_domains_mut<R>(&self, f: impl FnOnce(&mut CustomDomains) -> R) -> R;
}

pub trait CdnStableStrategy {
    fn with_assets<R>(&self, f: impl FnOnce(&ProposalAssetsStable) -> R) -> R;
    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut ProposalAssetsStable) -> R) -> R;

    fn with_content_chunks<R>(&self, f: impl FnOnce(&ProposalContentChunksStable) -> R) -> R;
    fn with_content_chunks_mut<R>(
        &self,
        f: impl FnOnce(&mut ProposalContentChunksStable) -> R,
    ) -> R;

    fn with_proposals<R>(&self, f: impl FnOnce(&ProposalsStable) -> R) -> R;
    fn with_proposals_mut<R>(&self, f: impl FnOnce(&mut ProposalsStable) -> R) -> R;
}

pub trait CdnWorkflowStrategy {
    fn pre_commit_assets(&self, proposal: &Proposal) -> Result<(), String>;
    fn post_commit_assets(&self, proposal: &Proposal) -> Result<(), String>;
}

pub trait CdnCommitAssetsStrategy {
    fn insert_asset(
        &self,
        collection: &CollectionKey,
        full_path: &FullPath,
        asset: &Asset,
        rule: &Rule,
    );

    fn insert_asset_encoding(
        &self,
        full_path: &FullPath,
        encoding_type: &str,
        encoding: &AssetEncoding,
        asset: &mut Asset,
        rule: &Rule,
    );

    fn delete_assets(&self, collection: &CollectionKey) -> Result<(), String>;
}

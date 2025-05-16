use crate::proposals::ProposalsStable;
use crate::storage::{AssetsStable, ContentChunksStable};
use junobuild_collections::types::rules::Rules;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

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
    fn with_assets<R>(&self, f: impl FnOnce(&AssetsStable) -> R) -> R;
    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut AssetsStable) -> R) -> R;

    fn with_content_chunks<R>(&self, f: impl FnOnce(&ContentChunksStable) -> R) -> R;
    fn with_content_chunks_mut<R>(&self, f: impl FnOnce(&mut ContentChunksStable) -> R) -> R;

    fn with_proposals<R>(&self, f: impl FnOnce(&ProposalsStable) -> R) -> R;
    fn with_proposals_mut<R>(&self, f: impl FnOnce(&mut ProposalsStable) -> R) -> R;
}

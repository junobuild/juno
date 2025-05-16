use crate::memory::STATE;
use junobuild_cdn::strategies::{CdnHeapStrategy, CdnStableStrategy};
use junobuild_cdn::{AssetsStable, ContentChunksStable};
use junobuild_collections::types::rules::Rules;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

pub struct CdnHeap;

impl CdnHeapStrategy for CdnHeap {
    fn with_assets<R>(&self, f: impl FnOnce(&AssetsHeap) -> R) -> R {
        STATE.with(|state| {
            let storage = &state.borrow().heap.storage;
            f(&storage.assets)
        })
    }

    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut AssetsHeap) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.heap.storage.assets)
        })
    }

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
    fn with_assets<R>(&self, f: impl FnOnce(&AssetsStable) -> R) -> R {
        STATE.with(|state| {
            let stable = &state.borrow().stable;
            f(&stable.proposals_assets)
        })
    }

    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut AssetsStable) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.stable.proposals_assets)
        })
    }

    fn with_content_chunks<R>(&self, f: impl FnOnce(&ContentChunksStable) -> R) -> R {
        STATE.with(|state| {
            let stable = &state.borrow().stable;
            f(&stable.proposals_content_chunks)
        })
    }

    fn with_content_chunks_mut<R>(&self, f: impl FnOnce(&mut ContentChunksStable) -> R) -> R {
        STATE.with(|state| {
            let mut borrow = state.borrow_mut();
            f(&mut borrow.stable.proposals_content_chunks)
        })
    }
}

use crate::memory::STATE;
use crate::msg::COLLECTION_NOT_FOUND;
use crate::rules::types::rules::{Memory, Rule};
use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::{CustomDomain, CustomDomains, DomainName};
use crate::storage::types::state::{
    AssetsHeap, AssetsStable, FullPath, StableFullPath, StorageHeapState,
};
use crate::storage::types::store::Asset;
use crate::types::core::CollectionKey;

/// Assets

pub fn get_public_asset(full_path: &FullPath) -> Option<Asset> {
    // We cannot know on the web which memory has to be used. That's why we try first to get the asset from heap for performance reason.
    let heap_asset =
        STATE.with(|state| get_asset_heap(full_path, &state.borrow().heap.storage.assets));

    match heap_asset {
        Some(heap_asset) => Some(heap_asset),
        None => STATE.with(|state| get_asset_stable(full_path, &state.borrow().stable.assets)),
    }
}

pub fn get_asset(full_path: &FullPath, rule: &Rule) -> Option<Asset> {
    match rule.memory {
        Memory::Heap => {
            STATE.with(|state| get_asset_heap(full_path, &state.borrow().heap.storage.assets))
        }
        Memory::Stable => {
            STATE.with(|state| get_asset_stable(full_path, &state.borrow().stable.assets))
        }
    }
}

pub fn insert_asset(full_path: &FullPath, asset: &Asset, rule: &Rule) {
    match rule.memory {
        Memory::Heap => STATE.with(|state| {
            insert_asset_heap(
                full_path,
                asset,
                &mut state.borrow_mut().heap.storage.assets,
            )
        }),
        Memory::Stable => STATE.with(|state| {
            insert_asset_stable(full_path, asset, &mut state.borrow_mut().stable.assets)
        }),
    }
}

pub fn delete_asset(full_path: &FullPath, rule: &Rule) -> Option<Asset> {
    match rule.memory {
        Memory::Heap => STATE.with(|state| {
            delete_asset_heap(full_path, &mut state.borrow_mut().heap.storage.assets)
        }),
        Memory::Stable => STATE
            .with(|state| delete_asset_stable(full_path, &mut state.borrow_mut().stable.assets)),
    }
}

pub fn get_assets(collection: &CollectionKey, rule: &Rule) -> Vec<Asset> {
    match rule.memory {
        Memory::Heap => {
            STATE.with(|state| get_assets_heap(collection, &state.borrow().heap.storage.assets))
        }
        Memory::Stable => {
            STATE.with(|state| get_assets_stable(collection, &state.borrow().stable.assets))
        }
    }
}

// Get

fn get_asset_stable(full_path: &FullPath, assets: &AssetsStable) -> Option<Asset> {
    assets.get(&stable_full_path(full_path))
}

fn get_asset_heap(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

// Delete

fn delete_asset_stable(full_path: &FullPath, assets: &mut AssetsStable) -> Option<Asset> {
    assets.remove(&stable_full_path(full_path))
}

fn delete_asset_heap(full_path: &FullPath, assets: &mut AssetsHeap) -> Option<Asset> {
    assets.remove(full_path)
}

// Insert

fn insert_asset_stable(full_path: &FullPath, asset: &Asset, assets: &mut AssetsStable) {
    assets.insert(stable_full_path(full_path), asset.clone());
}

fn insert_asset_heap(full_path: &FullPath, asset: &Asset, assets: &mut AssetsHeap) {
    assets.insert(full_path.clone(), asset.clone());
}

// List

fn get_assets_stable(collection: &CollectionKey, assets: &AssetsStable) -> Vec<Asset> {
    assets
        .iter()
        .filter(|(_, asset)| asset.key.collection == collection.clone())
        .map(|(_, asset)| asset)
        .collect()
}

fn get_assets_heap(collection: &CollectionKey, assets: &AssetsHeap) -> Vec<Asset> {
    assets
        .iter()
        .filter(|(_, asset)| asset.key.collection == collection.clone())
        .map(|(_, asset)| asset.clone())
        .collect()
}

fn stable_full_path(full_path: &FullPath) -> StableFullPath {
    StableFullPath {
        full_path: full_path.clone(),
    }
}

/// Rules

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let rules = &state.borrow().heap.storage.rules.clone();
        let rule = rules.get(collection);

        rule.cloned()
    });

    match rule {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(rule) => Ok(rule),
    }
}

/// Custom domains

pub fn get_domains() -> CustomDomains {
    STATE.with(|state| state.borrow().heap.storage.custom_domains.clone())
}

pub fn get_domain(domain_name: &DomainName) -> Option<CustomDomain> {
    STATE.with(|state| {
        let domains = state.borrow().heap.storage.custom_domains.clone();
        let domain = domains.get(domain_name);
        domain.cloned()
    })
}

pub fn insert_domain(domain_name: &DomainName, custom_domain: &CustomDomain) {
    STATE.with(|state| {
        insert_domain_impl(
            domain_name,
            custom_domain,
            &mut state.borrow_mut().heap.storage.custom_domains,
        )
    })
}

pub fn delete_domain(domain_name: &DomainName) {
    STATE.with(|state| {
        delete_domain_impl(
            domain_name,
            &mut state.borrow_mut().heap.storage.custom_domains,
        )
    })
}

fn insert_domain_impl(
    domain_name: &DomainName,
    custom_domain: &CustomDomain,
    custom_domains: &mut CustomDomains,
) {
    custom_domains.insert(domain_name.clone(), custom_domain.clone());
}

fn delete_domain_impl(domain_name: &DomainName, custom_domains: &mut CustomDomains) {
    custom_domains.remove(domain_name);
}

///
/// Config
///

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.storage.config.clone())
}

pub fn insert_config(config: &StorageConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn insert_config_impl(config: &StorageConfig, state: &mut StorageHeapState) {
    state.config = config.clone();
}

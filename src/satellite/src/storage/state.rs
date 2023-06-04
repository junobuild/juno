use crate::memory::STATE;
use crate::rules::types::rules::{Memory, Rule};
use crate::storage::types::state::{AssetsHeap, AssetsStable, FullPath, StableFullPath};
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
    let value = assets.get(full_path);
    value.cloned()
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

pub fn get_rules(collection: &CollectionKey) -> Option<Rule> {
    STATE.with(|state| {
        let state = &state.borrow().heap.storage.rules.clone();
        let rules = state.get(collection);

        rules.cloned()
    })
}

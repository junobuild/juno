use crate::constants::DEFAULT_RELEASES_COLLECTIONS;
use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use junobuild_collections::constants_assets::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_shared::types::memory::Memory;
use junobuild_storage::types::state::StorageHeapState;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const MISSION_CONTROLS: MemoryId = MemoryId::new(1);
const PAYMENTS: MemoryId = MemoryId::new(2);
const ASSETS: MemoryId = MemoryId::new(3);
const CONTENT_CHUNKS: MemoryId = MemoryId::new(4);
const PROPOSALS: MemoryId = MemoryId::new(5);

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

fn get_memory_mission_controls() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(MISSION_CONTROLS))
}

fn get_memory_payments() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PAYMENTS))
}

fn get_memory_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ASSETS))
}

fn get_memory_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(CONTENT_CHUNKS))
}

fn get_memory_proposals() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSALS))
}

pub fn init_stable_state() -> StableState {
    StableState {
        mission_controls: StableBTreeMap::init(get_memory_mission_controls()),
        payments: StableBTreeMap::init(get_memory_payments()),
        proposals_assets: StableBTreeMap::init(get_memory_assets()),
        proposals_content_chunks: StableBTreeMap::init(get_memory_content_chunks()),
        proposals: StableBTreeMap::init(get_memory_proposals()),
    }
}

pub fn init_storage_heap_state() -> StorageHeapState {
    let mut collections = Vec::with_capacity(2);
    collections.extend_from_slice(&DEFAULT_ASSETS_COLLECTIONS);
    collections.extend_from_slice(&DEFAULT_RELEASES_COLLECTIONS);

    StorageHeapState::new_with_storage_collections(collections)
}

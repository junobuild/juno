use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const MISSION_CONTROLS: MemoryId = MemoryId::new(1);
const PAYMENTS: MemoryId = MemoryId::new(2);
const BATCH_GROUP_ASSETS: MemoryId = MemoryId::new(3);
const BATCH_GROUP_CONTENT_CHUNKS: MemoryId = MemoryId::new(4);
const BATCH_GROUP_PROPOSALS: MemoryId = MemoryId::new(5);

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

fn get_memory_batch_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(BATCH_GROUP_ASSETS))
}

fn get_memory_batch_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(BATCH_GROUP_CONTENT_CHUNKS))
}

fn get_memory_batch_group_proposals() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(BATCH_GROUP_PROPOSALS))
}

pub fn init_stable_state() -> StableState {
    StableState {
        mission_controls: StableBTreeMap::init(get_memory_mission_controls()),
        payments: StableBTreeMap::init(get_memory_payments()),
        batch_assets: StableBTreeMap::init(get_memory_batch_assets()),
        batch_content_chunks: StableBTreeMap::init(get_memory_batch_content_chunks()),
        batch_group_proposals: StableBTreeMap::init(get_memory_batch_group_proposals()),
    }
}

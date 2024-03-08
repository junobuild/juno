use crate::db::types::state::CollectionStable;
use crate::types::memory::Memory;
use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const DB: MemoryId = MemoryId::new(1);
const ASSETS: MemoryId = MemoryId::new(2);
const CONTENT_CHUNKS: MemoryId = MemoryId::new(3);

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

fn get_memory_db() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(DB))
}

fn get_memory_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ASSETS))
}

fn get_memory_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(CONTENT_CHUNKS))
}

fn get_memory_collections(index: u8) -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3 + index)))
}

pub fn init_stable_state() -> StableState {
    StableState {
        db: StableBTreeMap::init(get_memory_db()),
        collections: None,
        assets: StableBTreeMap::init(get_memory_assets()),
        content_chunks: StableBTreeMap::init(get_memory_content_chunks()),
    }
}

pub fn init_stable_collection(index: u8) -> CollectionStable {
    StableBTreeMap::init(get_memory_collections(index))
}

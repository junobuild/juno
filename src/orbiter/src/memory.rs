use crate::types::memory::Memory;
use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const PAGE_VIEWS: MemoryId = MemoryId::new(1);
const TRACK_EVENTS: MemoryId = MemoryId::new(2);
const SATELLITES_PAGE_VIEWS: MemoryId = MemoryId::new(3);
const SATELLITES_TRACK_EVENTS: MemoryId = MemoryId::new(4);

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

fn get_memory(memory_id: MemoryId) -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(memory_id))
}

pub fn init_stable_state() -> StableState {
    StableState {
        page_views: StableBTreeMap::init(get_memory(PAGE_VIEWS)),
        track_events: StableBTreeMap::init(get_memory(TRACK_EVENTS)),
        satellites_page_views: StableBTreeMap::init(get_memory(SATELLITES_PAGE_VIEWS)),
        satellites_track_events: StableBTreeMap::init(get_memory(SATELLITES_TRACK_EVENTS)),
    }
}

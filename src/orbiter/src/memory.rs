use crate::constants::MONTHS;
use crate::types::memory::Memory;
use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const PAGE_VIEWS_INDEX: u8 = 1;
const TRACK_EVENTS_INDEX: u8 = MONTHS + PAGE_VIEWS_INDEX;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

fn get_memory_page_views(i: &u8) -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(PAGE_VIEWS_INDEX + i)))
}

fn get_memory_track_events(i: &u8) -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(TRACK_EVENTS_INDEX + i)))
}

pub fn init_stable_state() -> StableState {
    StableState {
        page_views: [0; MONTHS as usize]
            .iter()
            .map(|i| StableBTreeMap::init(get_memory_page_views(i)))
            .collect(),
        track_events: [0; MONTHS as usize]
            .iter()
            .map(|i| StableBTreeMap::init(get_memory_track_events(i)))
            .collect(),
    }
}

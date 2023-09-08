use crate::types::memory::Memory;
use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

// https://doc.servo.org/chrono/naive/struct.NaiveDate.html#method.ordinal
const DAYS: usize = 366;

const UPGRADES: MemoryId = MemoryId::new(0);
const PAGE_VIEWS_INDEX: u8 = 1;
const TRACK_EVENTS: MemoryId = MemoryId::new(2);

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

fn get_memory_track_events() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(TRACK_EVENTS))
}

pub fn init_stable_state() -> StableState {
    StableState {
        page_views: [0; DAYS - 1]
            .iter()
            .map(|i| StableBTreeMap::init(get_memory_page_views(i)))
            .collect(),
        track_events: StableBTreeMap::init(get_memory_track_events()),
    }
}

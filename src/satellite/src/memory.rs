use crate::types::memory::Memory;
use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const DB: MemoryId = MemoryId::new(1);

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

pub fn init_stable_state() -> StableState {
    StableState {
        db: StableBTreeMap::init(get_memory_db()),
    }
}

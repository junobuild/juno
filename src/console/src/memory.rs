use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const MISSION_CONTROLS: MemoryId = MemoryId::new(1);
const PAYMENTS: MemoryId = MemoryId::new(2);

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

pub fn init_stable_state() -> StableState {
    StableState {
        mission_controls: StableBTreeMap::init(get_memory_mission_controls()),
        payments: StableBTreeMap::init(get_memory_payments()),
    }
}

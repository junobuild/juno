use crate::memory::state::services::mutate_runtime_state;
use crate::types::runtime::RuntimeState;
use crate::types::state::StableState;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const NOTIFICATIONS: MemoryId = MemoryId::new(1);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn init_runtime_state() {
    mutate_runtime_state(|runtime| *runtime = RuntimeState::default());
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

fn get_memory_notifications() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(NOTIFICATIONS))
}

pub fn init_stable_state() -> StableState {
    StableState {
        notifications: StableBTreeMap::init(get_memory_notifications()),
    }
}

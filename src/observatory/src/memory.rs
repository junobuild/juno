use crate::types::state::State;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::state::StableControllers;
use std::cell::RefCell;

const CONTROLLERS_MEMORY_ID: MemoryId = MemoryId::new(0);

thread_local! {
    /// TODO: to be removed
    pub static STATE: RefCell<State> = RefCell::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    pub static CONTROLLERS_STATE: RefCell<StableControllers> = RefCell::new(StableBTreeMap::init(
        MEMORY_MANAGER.with(|memory_manager| memory_manager.borrow().get(CONTROLLERS_MEMORY_ID)),
    ));
}

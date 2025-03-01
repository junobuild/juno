use crate::memory::manager::{
    get_memory_assets, get_memory_content_chunks, get_memory_db, get_memory_upgrades,
};
use crate::types::state::{StableState, State};
use ic_stable_structures::StableBTreeMap;
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();
}

pub fn get_memory_for_upgrade() -> Memory {
    get_memory_upgrades()
}

pub fn init_stable_state() -> StableState {
    StableState {
        db: StableBTreeMap::init(get_memory_db()),
        assets: StableBTreeMap::init(get_memory_assets()),
        content_chunks: StableBTreeMap::init(get_memory_content_chunks()),
    }
}

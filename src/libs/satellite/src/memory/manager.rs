use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const DB: MemoryId = MemoryId::new(1);
const ASSETS: MemoryId = MemoryId::new(2);
const CONTENT_CHUNKS: MemoryId = MemoryId::new(3);
const POLYFILL: MemoryId = MemoryId::new(4);
const PROPOSAL_ASSETS: MemoryId = MemoryId::new(5);
const PROPOSAL_CONTENT_CHUNKS: MemoryId = MemoryId::new(6);
const PROPOSALS: MemoryId = MemoryId::new(7);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

pub fn get_memory_db() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(DB))
}

pub fn get_memory_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ASSETS))
}

pub fn get_memory_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(CONTENT_CHUNKS))
}

pub fn get_memory_polyfill() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(POLYFILL))
}

pub fn get_memory_proposal_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSAL_ASSETS))
}

pub fn get_memory_proposal_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSAL_CONTENT_CHUNKS))
}

pub fn get_memory_proposals() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSALS))
}

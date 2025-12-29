use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const ACCOUNTS: MemoryId = MemoryId::new(1);
const ICP_PAYMENTS: MemoryId = MemoryId::new(2);
const PROPOSAL_ASSETS: MemoryId = MemoryId::new(3);
const PROPOSAL_CONTENT_CHUNKS: MemoryId = MemoryId::new(4);
const PROPOSALS: MemoryId = MemoryId::new(5);
const SEGMENTS: MemoryId = MemoryId::new(6);
const ICRC_PAYMENTS: MemoryId = MemoryId::new(7);

thread_local! {
    pub static STATE: RefCell<State> = RefCell::default();

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
}

pub fn get_memory_upgrades() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

fn get_memory_accounts() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ACCOUNTS))
}

fn get_memory_icp_payments() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ICP_PAYMENTS))
}

fn get_memory_icrc_payments() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ICRC_PAYMENTS))
}

fn get_memory_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSAL_ASSETS))
}

fn get_memory_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSAL_CONTENT_CHUNKS))
}

fn get_memory_proposals() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSALS))
}

fn get_memory_segments() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(SEGMENTS))
}

pub fn init_stable_state() -> StableState {
    StableState {
        accounts: StableBTreeMap::init(get_memory_accounts()),
        icp_payments: StableBTreeMap::init(get_memory_icp_payments()),
        icrc_payments: StableBTreeMap::init(get_memory_icrc_payments()),
        proposals_assets: StableBTreeMap::init(get_memory_assets()),
        proposals_content_chunks: StableBTreeMap::init(get_memory_content_chunks()),
        proposals: StableBTreeMap::init(get_memory_proposals()),
        segments: StableBTreeMap::init(get_memory_segments()),
    }
}

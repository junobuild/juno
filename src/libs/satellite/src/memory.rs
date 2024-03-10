use crate::db::types::state::{DbCollectionStable, DbCollectionsIds};
use crate::types::memory::Memory;
use crate::types::state::{StableState, State};
use ic_cdk::print;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::StableBTreeMap;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const DB: MemoryId = MemoryId::new(1);
const ASSETS: MemoryId = MemoryId::new(2);
const CONTENT_CHUNKS: MemoryId = MemoryId::new(3);
const DB_COLLECTION_IDS: MemoryId = MemoryId::new(4);

const DB_COLLECTION_START_INDEX: u8 = 50;

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

fn get_memory_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(ASSETS))
}

fn get_memory_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(CONTENT_CHUNKS))
}

fn get_memory_db_collections_ids() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(DB_COLLECTION_IDS))
}

fn get_memory_db_collection(index: u8) -> Memory {
    MEMORY_MANAGER.with(|m| {
        m.borrow()
            .get(MemoryId::new(DB_COLLECTION_START_INDEX + index))
    })
}

pub fn init_stable_state() -> StableState {
    let db_collections_ids: DbCollectionsIds =
        StableBTreeMap::init(get_memory_db_collections_ids());

    let db_collections = db_collections_ids
        .iter()
        .map(|(key, index)| {
            let db_collection = init_stable_db_collection(index);
            (key, db_collection)
        })
        .collect();

    StableState {
        db: StableBTreeMap::init(get_memory_db()),
        db_collections_ids,
        db_collections,
        assets: StableBTreeMap::init(get_memory_assets()),
        content_chunks: StableBTreeMap::init(get_memory_content_chunks()),
    }
}

pub fn init_stable_db_collection(index: u8) -> DbCollectionStable {
    StableBTreeMap::init(get_memory_db_collection(index))
}

use crate::types::state::{StableState, State};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};
use ic_stable_structures::StableBTreeMap;
use ic_stable_structures::{DefaultMemoryImpl, Memory as _};
use junobuild_shared::types::memory::Memory;
use std::cell::RefCell;

const UPGRADES: MemoryId = MemoryId::new(0);
const MISSION_CONTROLS: MemoryId = MemoryId::new(1);
const PAYMENTS: MemoryId = MemoryId::new(2);
const PROPOSAL_ASSETS: MemoryId = MemoryId::new(3);
const PROPOSAL_CONTENT_CHUNKS: MemoryId = MemoryId::new(4);
const PROPOSALS: MemoryId = MemoryId::new(5);

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

fn get_memory_assets() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSAL_ASSETS))
}

fn get_memory_content_chunks() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSAL_CONTENT_CHUNKS))
}

fn get_memory_proposals() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(PROPOSALS))
}

pub fn init_stable_state() -> StableState {
    StableState {
        mission_controls: StableBTreeMap::init(get_memory_mission_controls()),
        payments: StableBTreeMap::init(get_memory_payments()),
        proposals_assets: StableBTreeMap::init(get_memory_assets()),
        proposals_content_chunks: StableBTreeMap::init(get_memory_content_chunks()),
        proposals: StableBTreeMap::init(get_memory_proposals()),
    }
}

// TODO: One time upgrade - To be removed.

// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
// ⚠️ The introduction of the CDN requires a breaking change due to how content chunks are handled.
// ⚠️ Therefore we're starting fresh.
// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

pub fn free_stable_memory() {
    MEMORY_MANAGER.with(|m| {
        let memory_manager = m.borrow();

        for memory_id in [PROPOSAL_ASSETS, PROPOSAL_CONTENT_CHUNKS, PROPOSALS] {
            // This cleans up the memory by writing a single zero byte to the memory id,
            // this will make the memory id available for reuse in the future.
            //
            // This makes sure that if `init` is called on the memory id, it will make sure
            // it can be reused with a different datatype.
            let memory = memory_manager.get(memory_id);
            if memory.size() > 0 {
                // This marks the memory as unused, this is because the StableBTreeMap
                // implementation uses the first three bytes of the memory to store the MAGIC value [66, 84, 82]
                // that indicates that the memory is used by the StableBTreeMap, so adding a single different byte
                // in those first three bytes will make the memory available for reuse.
                memory.write(0, &[0]);
            }
        }
    })
}

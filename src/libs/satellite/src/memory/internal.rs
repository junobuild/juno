use crate::memory::manager::{
    get_memory_assets, get_memory_content_chunks, get_memory_db, get_memory_polyfill,
    get_memory_upgrades,
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

type InitPolyfillMemoryFn = fn(Memory);

/// Registers a memory for a polyfill and initializes it using a provided function.
///
/// # Parameters
/// - `init_fn`: A function that takes `Memory` and performs initialization.
///
/// # ⚠️ Warning
/// **This is a reserved function and should not be used by developers writing serverless functions.**
/// Improper use may lead to **unpredictable issues**, including memory corruption or unexpected failures.
/// Serverless functions should rely on the provided execution environment instead.
///
/// # Notes
/// - This function **encapsulates** memory access, ensuring that the correct
///   memory region (`POLYFILL`) is used.
/// - The initialization function **must not assume memory is already initialized**.
#[doc(hidden)]
pub fn register_polyfill_memory(init_fn: InitPolyfillMemoryFn) {
    let memory = get_memory_polyfill();
    init_fn(memory);
}

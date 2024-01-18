use crate::types::interface::MemorySize;
use core::arch::wasm32::memory_size as wasm_memory_size;
use ic_cdk::api::stable::{stable_size, WASM_PAGE_SIZE_IN_BYTES};

pub fn memory_size() -> MemorySize {
    MemorySize {
        heap: wasm_memory_size(0) * WASM_PAGE_SIZE_IN_BYTES,
        stable: stable_size() as usize * WASM_PAGE_SIZE_IN_BYTES,
    }
}

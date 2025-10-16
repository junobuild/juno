use crate::types::interface::MemorySize;
#[cfg(target_arch = "wasm32")]
use core::arch::wasm32::memory_size as wasm_memory_size;
use ic_cdk::api::stable::{stable_size, WASM_PAGE_SIZE_IN_BYTES};

/// Returns the current memory usage of the WebAssembly module.
///
/// This function calculates the memory size allocated for both the heap and the stable storage
/// by querying the WebAssembly system interface and the Internet Computer's stable storage API.
///
/// # Returns
/// A `MemorySize` struct containing two fields:
/// - `heap`: The total size of the WebAssembly module's heap memory in bytes.
/// - `stable`: The total size of the stable storage used by the module in bytes.
///
/// Both sizes are calculated based on the WebAssembly page size.
///
/// # Example
/// ```
/// let memory_usage = junobuild_shared::canister::memory_size();
/// println!("Heap size: {} bytes", memory_usage.heap);
/// println!("Stable storage size: {} bytes", memory_usage.stable);
/// ```
///
#[cfg(target_arch = "wasm32")]
pub fn memory_size() -> MemorySize {
    MemorySize {
        heap: wasm_memory_size(0) as u64 * WASM_PAGE_SIZE_IN_BYTES,
        stable: stable_size() * WASM_PAGE_SIZE_IN_BYTES,
    }
}

// For cargo test only
#[cfg(not(target_arch = "wasm32"))]
pub fn memory_size() -> MemorySize {
    MemorySize { heap: 0, stable: 0 }
}

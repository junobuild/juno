use junobuild_shared::canister::memory_size;
use junobuild_shared::types::interface::MemorySize;
use junobuild_storage::types::config::StorageConfig;

pub fn assert_memory_size(config: &StorageConfig) -> Result<(), String> {
    if let Some(max_memory_size) = &config.max_memory_size {
        let MemorySize { heap, stable } = memory_size();

        if let Some(max_heap) = max_memory_size.heap {
            if heap > max_heap {
                return Err(format!(
                    "Heap memory usage exceeded: {} bytes used, {} bytes allowed.",
                    heap, max_heap
                ));
            }
        }

        if let Some(max_stable) = max_memory_size.stable {
            if stable > max_stable {
                return Err(format!(
                    "Stable memory usage exceeded: {} bytes used, {} bytes allowed.",
                    stable, max_stable
                ));
            }
        }
    }

    Ok(())
}

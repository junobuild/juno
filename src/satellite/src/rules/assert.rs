use shared::assert::assert_timestamp;
use crate::rules::constants::SYS_COLLECTION_PREFIX;
use crate::rules::types::rules::{Memory, Rule};
use crate::types::core::CollectionKey;

pub fn assert_memory(current_rule: Option<&Rule>, memory: &Option<Memory>) -> Result<(), String> {
    // Validate memory type does not change
    match current_rule {
        None => (),
        Some(current_rule) => match memory {
            None => {
                return Err("The type of memory must be provided.".to_string());
            }
            Some(Memory::Heap) => {
                if !matches!(&current_rule.memory, Memory::Heap) {
                    return Err("The type of memory cannot be modified to heap.".to_string());
                }
            }
            Some(Memory::Stable) => {
                if !matches!(&current_rule.memory, Memory::Stable) {
                    return Err("The type of memory cannot be modified to stable.".to_string());
                }
            }
        },
    }

    Ok(())
}


pub fn assert_mutable(current_rule: Option<&Rule>, mutable: &Option<bool>) -> Result<(), String> {
    // Validate mutability does not change
    match current_rule {
        None => (),
        Some(current_rule) => match mutable {
            None => {
                return Err("The mutability must be provided.".to_string());
            }
            Some(mutable) => {
                if &current_rule.mutable != mutable && !current_rule.mutable {
                    return Err("An immutable rule cannot be modified.".to_string());
                }
            }
        },
    }

    Ok(())
}

pub fn assert_write_permission(
    collection: &CollectionKey,
    current_rule: Option<&Rule>,
    updated_at: &Option<u64>,
) -> Result<(), String> {
    // Validate timestamp
    match current_rule {
        None => (),
        Some(current_rule) => match assert_timestamp(*updated_at, current_rule.updated_at) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    if collection.starts_with(|c| c == SYS_COLLECTION_PREFIX) {
        return Err(format!(
            "Collection starts with {}, a reserved prefix",
            SYS_COLLECTION_PREFIX
        ));
    }

    Ok(())
}
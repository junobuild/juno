use crate::rules::constants::SYS_COLLECTION_PREFIX;
use crate::rules::types::interface::SetRule;
use crate::rules::types::rules::{Memory, Rule};
use crate::types::core::CollectionKey;
use shared::assert::assert_timestamp;

pub fn assert_memory(current_rule: Option<&Rule>, memory: &Option<Memory>) -> Result<(), String> {
    // Validate memory type does not change
    match current_rule {
        None => (),
        Some(current_rule) => match memory {
            None => {
                return Err("The type of memory must be provided.".to_string());
            }
            Some(Memory::Heap) => {
                if !matches!(&current_rule.mem(), Memory::Heap) {
                    return Err("The type of memory cannot be modified to heap.".to_string());
                }
            }
            Some(Memory::Stable) => {
                if !matches!(&current_rule.mem(), Memory::Stable) {
                    return Err("The type of memory cannot be modified to stable.".to_string());
                }
            }
        },
    }

    Ok(())
}

pub fn assert_mutable_permissions(
    current_rule: Option<&Rule>,
    user_rule: &SetRule,
) -> Result<(), String> {
    // Validate mutability does not change
    match current_rule {
        None => (),
        Some(current_rule) => match user_rule.mutable_permissions {
            None => {
                return Err("The immutable permissions information must be provided.".to_string());
            }
            Some(mutable_permissions) => {
                let current_permissions = current_rule.mutable_permissions.unwrap_or(true);

                if current_permissions != mutable_permissions && !current_permissions {
                    return Err("The immutable permissions cannot be made mutable.".to_string());
                }
            }
        },
    }

    // Validate permissions do not change
    match current_rule {
        None => (),
        Some(current_rule) => {
            if current_rule.write != user_rule.write
                && !current_rule.mutable_permissions.unwrap_or(true)
            {
                return Err("The write permission is immutable.".to_string());
            }

            if current_rule.read != user_rule.read
                && !current_rule.mutable_permissions.unwrap_or(true)
            {
                return Err("The read permission is immutable.".to_string());
            }
        }
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

use crate::assert::collection::{is_not_system_collection, is_system_collection};
use crate::constants::core::SYS_COLLECTION_PREFIX;
use crate::errors::{
    JUNO_COLLECTIONS_ERROR_DELETE_PREFIX_RESERVED,
    JUNO_COLLECTIONS_ERROR_MODIFY_RESERVED_COLLECTION, JUNO_COLLECTIONS_ERROR_PREFIX_RESERVED,
    JUNO_COLLECTIONS_ERROR_RATE_CONFIG_ENABLED, JUNO_COLLECTIONS_ERROR_RESERVED_NAME,
};
use crate::types::core::CollectionKey;
use crate::types::interface::SetRule;
use crate::types::rules::{Memory, Rule, Rules};
use junobuild_shared::assert::assert_version;
use junobuild_shared::types::state::Version;

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

pub fn assert_write_version(
    current_rule: Option<&Rule>,
    version: &Option<Version>,
) -> Result<(), String> {
    // Validate timestamp
    match current_rule {
        None => (),
        Some(current_rule) => match assert_version(*version, current_rule.version) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    Ok(())
}

pub fn assert_system_collection_set_permission(
    collection: &CollectionKey,
    current_rule: Option<&Rule>,
    user_rule: &SetRule,
) -> Result<(), String> {
    // Allow non-system collections to proceed without restrictions
    if is_not_system_collection(collection) {
        return Ok(());
    }

    // System collections cannot be created with a setter call but can be edited under certain circumstances.
    let current_rule =
        current_rule.ok_or_else(|| JUNO_COLLECTIONS_ERROR_PREFIX_RESERVED.to_string())?;

    if current_rule.read != user_rule.read
        || current_rule.write != user_rule.write
        || current_rule.memory != user_rule.memory
        || current_rule.mutable_permissions != user_rule.mutable_permissions
        || current_rule.max_size != user_rule.max_size
        || current_rule.max_capacity != user_rule.max_capacity
    {
        return Err(format!(
            "{} ({})",
            JUNO_COLLECTIONS_ERROR_MODIFY_RESERVED_COLLECTION, collection
        ));
    }

    if current_rule.rate_config.is_some() && user_rule.rate_config.is_none() {
        return Err(JUNO_COLLECTIONS_ERROR_RATE_CONFIG_ENABLED.to_string());
    }

    Ok(())
}

pub fn assert_system_collection_delete_permission(
    collection: &CollectionKey,
) -> Result<(), String> {
    if is_system_collection(collection) {
        return Err(format!(
            "{} ({})",
            JUNO_COLLECTIONS_ERROR_DELETE_PREFIX_RESERVED, SYS_COLLECTION_PREFIX
        ));
    }

    Ok(())
}

// In the storage, the collection name must be included within the path (e.g., /hello/index.html for the collection "hello").
// Therefore, to avoid conflicts with system collections like #dapp and #releases (used in the Console),
// we need to ensure that the custom collection name does not clash with any reserved system collection names.
pub fn assert_storage_reserved_collection(
    collection: &CollectionKey,
    rules: &Rules,
) -> Result<(), String> {
    // We do not have to check system collection.
    if is_system_collection(collection) {
        return Ok(());
    }

    let reserved_collection = format!("{}{}", SYS_COLLECTION_PREFIX, collection);

    if rules.contains_key(&reserved_collection) {
        return Err(JUNO_COLLECTIONS_ERROR_RESERVED_NAME.to_string());
    }

    Ok(())
}

use crate::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use crate::errors::{
    JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH, JUNO_STORAGE_ERROR_CANNOT_COMMIT_INVALID_COLLECTION,
    JUNO_STORAGE_ERROR_RESERVED_ASSET, JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED,
    JUNO_STORAGE_ERROR_UPLOAD_PATH_COLLECTION_PREFIX,
};
use crate::runtime::increment_and_assert_rate;
use crate::strategies::{StorageAssertionsStrategy, StorageStateStrategy};
use crate::types::config::StorageConfig;
use crate::types::interface::{CommitBatch, InitAssetKey};
use crate::types::state::FullPath;
use crate::types::store::{Asset, AssetAssertUpload, Batch};
use candid::Principal;
use junobuild_collections::assert::collection::is_system_collection;
use junobuild_collections::constants::assets::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::constants::core::SYS_COLLECTION_PREFIX;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::assert::{assert_description_length, assert_max_memory_size};
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::principal_not_equal;

pub fn assert_create_batch(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    init: &InitAssetKey,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
) -> Result<(), String> {
    assert_memory_size(config)?;

    assert_key(
        caller,
        &init.full_path,
        &init.collection,
        assertions,
        controllers,
    )?;

    assert_description_length(&init.description)?;

    let rule = storage_state.get_rule(&init.collection)?;

    increment_and_assert_rate(&init.collection, &rule.rate_config)?;

    Ok(())
}

pub fn assert_create_chunk(
    caller: Principal,
    config: &StorageConfig,
    batch: &Batch,
) -> Result<(), String> {
    if principal_not_equal(caller, batch.key.owner) {
        return Err("Bach initializer does not match chunk uploader.".to_string());
    }

    assert_memory_size(config)?;

    Ok(())
}

pub fn assert_commit_batch(
    caller: Principal,
    controllers: &Controllers,
    batch: &Batch,
    assertions: &impl StorageAssertionsStrategy,
    storage_state: &impl StorageStateStrategy,
) -> Result<Rule, String> {
    // The one that started the batch should be the one that commits it
    if principal_not_equal(caller, batch.key.owner) {
        return Err(JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_key(
        caller,
        &batch.key.full_path,
        &batch.key.collection,
        assertions,
        controllers,
    )?;

    // It is not really idiomatic to get the rule here and return it but, performance wise it is interesting.
    // This way the rule is not fetch if the key or principal does not match.
    // Plus this function was refactored from existing code, therefore this does not introduce a change but, solely a refactoring.
    let rule = storage_state.get_rule(&batch.key.collection)?;

    increment_and_assert_rate(&batch.key.collection, &rule.rate_config)?;

    Ok(rule)
}

pub fn assert_commit_chunks_new_asset(
    caller: Principal,
    collection: &CollectionKey,
    controllers: &Controllers,
    config: &StorageConfig,
    rule: &Rule,
    assertions: &impl StorageAssertionsStrategy,
) -> Result<(), String> {
    if !assertions.assert_create_permission(&rule.write, caller, collection, controllers) {
        return Err(JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_memory_size(config)?;

    Ok(())
}

pub fn assert_commit_chunks_update(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    batch: &Batch,
    rule: &Rule,
    current: &Asset,
    assertions: &impl StorageAssertionsStrategy,
) -> Result<(), String> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err(JUNO_STORAGE_ERROR_CANNOT_COMMIT_INVALID_COLLECTION.to_string());
    }

    if !assertions.assert_update_permission(
        &rule.write,
        current.key.owner,
        caller,
        &batch.key.collection,
        controllers,
    ) {
        return Err(JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_memory_size(config)?;

    Ok(())
}

pub fn assert_commit_chunks(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: &CommitBatch,
    batch: &Batch,
    current: &Option<Asset>,
    rule: &Rule,
    assertions: &impl StorageAssertionsStrategy,
) -> Result<(), String> {
    assertions.invoke_assert_upload_asset(
        &caller,
        &AssetAssertUpload {
            current: current.clone(),
            batch: batch.clone(),
            commit_batch: commit_batch.clone(),
        },
    )?;

    assertions.increment_and_assert_storage_usage(
        &caller,
        controllers,
        &batch.key.collection,
        rule.max_changes_per_user,
    )?;

    Ok(())
}

fn assert_memory_size(config: &StorageConfig) -> Result<(), String> {
    assert_max_memory_size(&config.max_memory_size)
}

/// Asserts whether a given caller is allowed to upload an asset to a specified collection and full_path.
///
/// This function performs several checks:
/// 1. Ensures the asset path is not targeting restricted well-known paths (used for custom domains or II alternative origins).
/// 2. Verifies that the caller is a controller if uploading to the default assets collection (`#dapp`) or any system collection (collections starting with `#`).
/// 3. Validates that the asset path is properly prefixed with the collection name (excluding system prefix `#`) if not uploading to `#dapp`.
/// 4. Calls the strategy assertion this way the consumer can implement custom validation on the full_path and collection.
///
/// # Arguments
/// * `caller` - The principal trying to upload the asset.
/// * `full_path` - The full path where the asset is to be stored.
/// * `collection` - The collection key (e.g., `#dapp`, `user-assets`, etc.).
/// * `controllers` - A list of principals allowed to control the storage.
///
/// # Returns
/// * `Ok(())` if all assertions pass.
/// * `Err(&'static str)` if any of the checks fail, with a descriptive error message.
///
/// # Errors
/// * `JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED` if the caller is not authorized to write to a protected collection.
/// * `"Asset path must be prefixed with collection key."` if the asset path does not follow the expected prefix structure.
///
/// # Notes
/// - Some paths like `/.well-known/ic-domains` and `/.well-known/ii-alternative-origins` are protected and handled specially.
/// - System collections are identified by the prefix `#` and have stricter permissions.
fn assert_key(
    caller: Principal,
    full_path: &FullPath,
    collection: &CollectionKey,
    assertions: &impl StorageAssertionsStrategy,
    controllers: &Controllers,
) -> Result<(), String> {
    // /.well-known/ic-domains is automatically generated for custom domains
    assert_well_known_key(full_path, WELL_KNOWN_CUSTOM_DOMAINS)?;

    // /.well-known/ii-alternative-origins is automatically generated for alternative origins
    assert_well_known_key(full_path, WELL_KNOWN_II_ALTERNATIVE_ORIGINS)?;

    let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;

    if is_system_collection(collection) {
        let allowed = if collection.clone() == *dapp_collection {
            // Whether a caller is allowed to write in reserved collections `#dapp`.
            assertions.assert_write_on_dapp_collection(caller, controllers)
        } else {
            // Whether a caller is allowed to write in reserved collections starting with `#`.
            assertions.assert_write_on_system_collection(caller, collection, controllers)
        };

        if !allowed {
            return Err(JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED.to_string());
        }
    }

    // Assets uploaded to a collection other than #dapp must be prefixed with the collection name (excluding the system collection prefix, if present).
    let collection_path = collection
        .strip_prefix(SYS_COLLECTION_PREFIX)
        .unwrap_or(collection);

    if collection.clone() != *dapp_collection
        && !full_path.starts_with(&["/", collection_path, "/"].join(""))
    {
        return Err(JUNO_STORAGE_ERROR_UPLOAD_PATH_COLLECTION_PREFIX.to_string());
    }

    assertions.assert_key(full_path, collection)?;

    Ok(())
}

fn assert_well_known_key(full_path: &str, reserved_path: &str) -> Result<(), String> {
    if full_path == reserved_path {
        return Err(format!(
            "{} ({})",
            JUNO_STORAGE_ERROR_RESERVED_ASSET, reserved_path
        ));
    }
    Ok(())
}

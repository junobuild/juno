use crate::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use crate::msg::{ERROR_CANNOT_COMMIT_BATCH, UPLOAD_NOT_ALLOWED};
use crate::runtime::increment_and_assert_rate;
use crate::strategies::{StorageAssertionsStrategy, StorageStateStrategy};
use crate::types::config::StorageConfig;
use crate::types::interface::{CommitBatch, InitAssetKey};
use crate::types::state::FullPath;
use crate::types::store::{Asset, AssetAssertUpload, Batch};
use candid::Principal;
use junobuild_collections::assert::stores::{assert_create_permission, assert_permission};
use junobuild_collections::constants::assets::DEFAULT_ASSETS_COLLECTIONS;
use junobuild_collections::constants::core::SYS_COLLECTION_PREFIX;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::assert::{assert_description_length, assert_max_memory_size};
use junobuild_shared::controllers::is_controller;
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::principal_not_equal;

pub fn assert_create_batch(
    caller: Principal,
    controllers: &Controllers,
    config: &StorageConfig,
    init: &InitAssetKey,
    storage_state: &impl StorageStateStrategy,
) -> Result<(), String> {
    assert_memory_size(config)?;

    assert_key(caller, &init.full_path, &init.collection, controllers)?;

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
    storage_state: &impl StorageStateStrategy,
) -> Result<Rule, String> {
    // The one that started the batch should be the one that commits it
    if principal_not_equal(caller, batch.key.owner) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_key(
        caller,
        &batch.key.full_path,
        &batch.key.collection,
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
    controllers: &Controllers,
    config: &StorageConfig,
    rule: &Rule,
) -> Result<(), String> {
    if !assert_create_permission(&rule.write, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
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
) -> Result<(), String> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err("Provided collection does not match existing collection.".to_string());
    }

    if !assert_permission(&rule.write, current.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
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

fn assert_key(
    caller: Principal,
    full_path: &FullPath,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> Result<(), &'static str> {
    // /.well-known/ic-domains is automatically generated for custom domains
    assert_well_known_key(full_path, WELL_KNOWN_CUSTOM_DOMAINS)?;

    // /.well-known/ii-alternative-origins is automatically generated for alternative origins
    assert_well_known_key(full_path, WELL_KNOWN_II_ALTERNATIVE_ORIGINS)?;

    let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;

    // Only controllers can write in collection #dapp
    if collection.clone() == *dapp_collection && !is_controller(caller, controllers) {
        return Err(UPLOAD_NOT_ALLOWED);
    }

    // Only controllers can write in reserved collections starting with #
    if collection.starts_with(SYS_COLLECTION_PREFIX) && !is_controller(caller, controllers) {
        return Err(UPLOAD_NOT_ALLOWED);
    }

    // Asset uploaded by users should be prefixed with the collection. That way developers can organize assets to particular folders.
    let collection_path = collection
        .strip_prefix(SYS_COLLECTION_PREFIX)
        .unwrap_or(collection);

    if collection.clone() != *dapp_collection
        && !full_path.starts_with(&["/", collection_path, "/"].join(""))
    {
        return Err("Asset path must be prefixed with collection key.");
    }

    Ok(())
}

fn assert_well_known_key(full_path: &str, reserved_path: &str) -> Result<(), &'static str> {
    if full_path == reserved_path {
        let error = format!("{} is a reserved asset.", reserved_path);
        return Err(Box::leak(error.into_boxed_str()));
    }
    Ok(())
}

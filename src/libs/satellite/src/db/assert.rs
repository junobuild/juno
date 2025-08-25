use crate::auth::caller::assert_caller_is_allowed;
use crate::db::runtime::increment_and_assert_rate;
use crate::db::types::config::DbConfig;
use crate::db::types::interface::SetDbConfig;
use crate::db::types::state::{DocAssertDelete, DocAssertSet, DocContext};
use crate::errors::db::{JUNO_DATASTORE_ERROR_CANNOT_READ, JUNO_DATASTORE_ERROR_CANNOT_WRITE};
use crate::hooks::db::{invoke_assert_delete_doc, invoke_assert_set_doc};
use crate::types::store::{AssertContext, StoreContext};
use crate::user::core::assert::{
    assert_user_collection_caller_key, assert_user_collection_data, assert_user_is_not_banned,
    assert_user_collection_write_permission,
};
use crate::user::usage::assert::{
    assert_user_usage_collection_data, increment_and_assert_db_usage,
};
use crate::user::webauthn::assert::{
    assert_user_webauthn_collection_data, assert_user_webauthn_collection_write_permission,
};
use crate::{DelDoc, Doc, SetDoc};
use candid::Principal;
use junobuild_collections::assert::stores::{
    assert_create_permission, assert_permission, public_permission,
};
use junobuild_collections::types::rules::Permission;
use junobuild_shared::assert::{assert_description_length, assert_max_memory_size, assert_version};
use junobuild_shared::types::core::Key;
use junobuild_shared::types::state::{Controllers, Version};

pub fn assert_get_doc(
    &StoreContext {
        caller,
        controllers,
        collection: _,
    }: &StoreContext,
    &AssertContext { rule, auth_config }: &AssertContext,
    current_doc: &Doc,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    assert_read_permission(caller, controllers, current_doc, &rule.read)?;

    Ok(())
}

pub fn assert_get_docs(
    &StoreContext {
        caller,
        controllers,
        collection: _,
    }: &StoreContext,
    &AssertContext {
        auth_config,
        rule: _,
    }: &AssertContext,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    Ok(())
}

pub fn assert_set_doc(
    &StoreContext {
        caller,
        controllers,
        collection,
    }: &StoreContext,
    &AssertContext { rule, auth_config }: &AssertContext,
    config: &Option<DbConfig>,
    key: &Key,
    value: &SetDoc,
    current_doc: &Option<Doc>,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    assert_user_collection_caller_key(caller, collection, key, current_doc)?;
    assert_user_collection_data(collection, value)?;
    assert_user_collection_write_permission(caller, controllers, collection, current_doc)?;

    assert_user_webauthn_collection_data(caller, collection, value)?;
    assert_user_webauthn_collection_write_permission(collection, current_doc)?;

    assert_write_permission(caller, controllers, current_doc, &rule.write)?;

    assert_memory_size(config)?;

    assert_write_version(current_doc, value.version)?;

    assert_description_length(&value.description)?;

    assert_user_usage_collection_data(collection, value)?;

    invoke_assert_set_doc(
        &caller,
        &DocContext {
            key: key.clone(),
            collection: collection.clone(),
            data: DocAssertSet {
                current: current_doc.clone(),
                proposed: value.clone(),
            },
        },
    )?;

    increment_and_assert_db_usage(caller, controllers, collection, rule.max_changes_per_user)?;

    increment_and_assert_rate(collection, &rule.rate_config)?;

    Ok(())
}

pub fn assert_delete_doc(
    &StoreContext {
        caller,
        controllers,
        collection,
    }: &StoreContext,
    &AssertContext { rule, auth_config }: &AssertContext,
    key: &Key,
    value: &DelDoc,
    current_doc: &Option<Doc>,
) -> Result<(), String> {
    assert_caller_is_allowed(caller, controllers, auth_config)?;
    assert_user_is_not_banned(caller, controllers)?;

    assert_write_permission(caller, controllers, current_doc, &rule.write)?;

    assert_write_version(current_doc, value.version)?;

    invoke_assert_delete_doc(
        &caller,
        &DocContext {
            key: key.clone(),
            collection: collection.clone(),
            data: DocAssertDelete {
                current: current_doc.clone(),
                proposed: value.clone(),
            },
        },
    )?;

    increment_and_assert_db_usage(caller, controllers, collection, rule.max_changes_per_user)?;

    increment_and_assert_rate(collection, &rule.rate_config)?;

    Ok(())
}

fn assert_memory_size(config: &Option<DbConfig>) -> Result<(), String> {
    match config {
        None => Ok(()),
        Some(config) => assert_max_memory_size(&config.max_memory_size),
    }
}

fn assert_read_permission(
    caller: Principal,
    controllers: &Controllers,
    current_doc: &Doc,
    rule: &Permission,
) -> Result<(), String> {
    if !assert_permission(rule, current_doc.owner, caller, controllers) {
        return Err(JUNO_DATASTORE_ERROR_CANNOT_READ.to_string());
    }

    Ok(())
}

fn assert_write_permission(
    caller: Principal,
    controllers: &Controllers,
    current_doc: &Option<Doc>,
    rule: &Permission,
) -> Result<(), String> {
    // For existing collection and document, check user editing is the caller
    if !public_permission(rule) {
        match current_doc {
            None => {
                if !assert_create_permission(rule, caller, controllers) {
                    return Err(JUNO_DATASTORE_ERROR_CANNOT_WRITE.to_string());
                }
            }
            Some(current_doc) => {
                if !assert_permission(rule, current_doc.owner, caller, controllers) {
                    return Err(JUNO_DATASTORE_ERROR_CANNOT_WRITE.to_string());
                }
            }
        }
    }

    Ok(())
}

fn assert_write_version(
    current_doc: &Option<Doc>,
    user_version: Option<Version>,
) -> Result<(), String> {
    // Validate timestamp
    match current_doc.clone() {
        None => (),
        Some(current_doc) => match assert_version(user_version, current_doc.version) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    Ok(())
}

pub fn assert_set_config(
    proposed_config: &SetDbConfig,
    current_config: &Option<DbConfig>,
) -> Result<(), String> {
    assert_config_version(current_config, proposed_config.version)?;

    Ok(())
}

fn assert_config_version(
    current_config: &Option<DbConfig>,
    proposed_version: Option<Version>,
) -> Result<(), String> {
    if let Some(cfg) = current_config {
        assert_version(proposed_version, cfg.version)?
    }

    Ok(())
}

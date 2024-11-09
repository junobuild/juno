use crate::db::msg::ERROR_CANNOT_WRITE;
use crate::db::runtime::increment_and_assert_rate;
use crate::db::types::config::DbConfig;
use crate::db::types::state::{DocAssertDelete, DocAssertSet, DocContext};
use crate::hooks::{invoke_assert_delete_doc, invoke_assert_set_doc};
use crate::rules::assert_stores::assert_user_collection_caller_key;
use crate::types::store::StoreContext;
use crate::{DelDoc, Doc, SetDoc};
use candid::Principal;
use junobuild_collections::assert_stores::{
    assert_create_permission, assert_permission, public_permission,
};
use junobuild_collections::types::rules::{Permission, Rule};
use junobuild_shared::assert::{assert_description_length, assert_max_memory_size, assert_version};
use junobuild_shared::types::core::Key;
use junobuild_shared::types::state::{Controllers, Version};

pub fn assert_set_doc(
    &StoreContext {
        caller,
        controllers,
        collection,
    }: &StoreContext,
    config: &Option<DbConfig>,
    key: &Key,
    value: &SetDoc,
    rule: &Rule,
    current_doc: &Option<Doc>,
) -> Result<(), String> {
    assert_write_permission(caller, controllers, current_doc, &rule.write)?;

    assert_memory_size(config)?;

    assert_write_version(current_doc, value.version)?;

    assert_description_length(&value.description)?;

    assert_user_collection_caller_key(caller, collection, key)?;

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

    increment_and_assert_rate(collection, &rule.rate_config)?;

    Ok(())
}

pub fn assert_delete_doc(
    &StoreContext {
        caller,
        controllers,
        collection,
    }: &StoreContext,
    key: &Key,
    value: &DelDoc,
    rule: &Rule,
    current_doc: &Option<Doc>,
) -> Result<(), String> {
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

    increment_and_assert_rate(collection, &rule.rate_config)?;

    Ok(())
}

fn assert_memory_size(config: &Option<DbConfig>) -> Result<(), String> {
    match config {
        None => Ok(()),
        Some(config) => assert_max_memory_size(&config.max_memory_size),
    }
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
                    return Err(ERROR_CANNOT_WRITE.to_string());
                }
            }
            Some(current_doc) => {
                if !assert_permission(rule, current_doc.owner, caller, controllers) {
                    return Err(ERROR_CANNOT_WRITE.to_string());
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

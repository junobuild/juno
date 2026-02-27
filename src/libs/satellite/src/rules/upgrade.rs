use crate::assets::constants::{
    CDN_JUNO_RELEASES_COLLECTION_KEY, COLLECTION_RELEASES_DEFAULT_RULE,
};
use crate::memory::state::services::{
    with_db_rules, with_db_rules_mut, with_storage_rules, with_storage_rules_mut,
};
use junobuild_collections::constants::db::{
    COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE, COLLECTION_AUTOMATION_TOKEN_KEY,
    COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE, COLLECTION_AUTOMATION_WORKFLOW_KEY,
    COLLECTION_LOG_DEFAULT_RULE, COLLECTION_LOG_KEY, COLLECTION_USER_USAGE_DEFAULT_RULE,
    COLLECTION_USER_USAGE_KEY,
};
use junobuild_collections::constants::db::{
    COLLECTION_USER_WEBAUTHN_DEFAULT_RULE, COLLECTION_USER_WEBAUTHN_INDEX_DEFAULT_RULE,
    COLLECTION_USER_WEBAUTHN_INDEX_KEY, COLLECTION_USER_WEBAUTHN_KEY,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::Rule;
// ---------------------------------------------------------
// One time upgrade
// ---------------------------------------------------------

pub fn init_system_collections() {
    init_db_collections();

    init_storage_collections();
}

fn init_db_collections() {
    // Logs
    init_log_collection();

    // User usage
    init_user_usage_collection();

    // WebAuthn authentication
    init_user_webauthn_collection();
    init_user_webauthn_index_collection();

    // Automation
    init_automation_token_collection();
    init_automation_workflow_collection();
}

fn init_storage_collections() {
    init_juno_releases_collection();
}

fn init_log_collection() {
    init_db_collection(&COLLECTION_LOG_KEY.to_string(), COLLECTION_LOG_DEFAULT_RULE);
}

fn init_user_usage_collection() {
    init_db_collection(
        &COLLECTION_USER_USAGE_KEY.to_string(),
        COLLECTION_USER_USAGE_DEFAULT_RULE,
    );
}

fn init_user_webauthn_collection() {
    init_db_collection(
        &COLLECTION_USER_WEBAUTHN_KEY.to_string(),
        COLLECTION_USER_WEBAUTHN_DEFAULT_RULE,
    );
}

fn init_user_webauthn_index_collection() {
    init_db_collection(
        &COLLECTION_USER_WEBAUTHN_INDEX_KEY.to_string(),
        COLLECTION_USER_WEBAUTHN_INDEX_DEFAULT_RULE,
    );
}

fn init_automation_token_collection() {
    init_db_collection(
        &COLLECTION_AUTOMATION_TOKEN_KEY.to_string(),
        COLLECTION_AUTOMATION_TOKEN_DEFAULT_RULE,
    );
}

fn init_automation_workflow_collection() {
    init_db_collection(
        &COLLECTION_AUTOMATION_WORKFLOW_KEY.to_string(),
        COLLECTION_AUTOMATION_WORKFLOW_DEFAULT_RULE,
    );
}

fn init_db_collection(collection: &CollectionKey, default_rule: SetRule) {
    let col = with_db_rules(|rules| rules.get(collection).cloned());

    if col.is_none() {
        with_db_rules_mut(|rules| {
            let rule: Rule = default_rule.into();
            rules.insert(collection.to_string(), rule);
        });
    }
}

fn init_juno_releases_collection() {
    init_storage_collection(
        &CDN_JUNO_RELEASES_COLLECTION_KEY.to_string(),
        COLLECTION_RELEASES_DEFAULT_RULE,
    );
}

fn init_storage_collection(collection: &CollectionKey, default_rule: SetRule) {
    let col = with_storage_rules(|rules| rules.get(collection).cloned());

    if col.is_none() {
        with_storage_rules_mut(|rules| {
            let rule: Rule = default_rule.into();
            rules.insert(collection.to_string(), rule);
        });
    }
}

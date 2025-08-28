use crate::types::interface::SetRule;
use crate::types::rules::Memory;
use crate::types::rules::Permission::{Controllers, Managed, Public};
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;

pub const COLLECTION_USER_KEY: &str = "#user";
pub const COLLECTION_LOG_KEY: &str = "#log";
pub const COLLECTION_USER_USAGE_KEY: &str = "#user-usage";
pub const COLLECTION_USER_WEBAUTHN_KEY: &str = "#user-webauthn";
pub const COLLECTION_USER_WEBAUTHN_INDEX_KEY: &str = "#user-webauthn-index";

const COLLECTION_USER_DEFAULT_RULE: SetRule = SetRule {
    read: Managed,
    // ❗Managed, BUT an assertion prevents the user from updating the entry.
    write: Managed,
    memory: Some(Memory::Stable),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: None,
    max_changes_per_user: None,
    version: None,
    rate_config: Some(DEFAULT_RATE_CONFIG),
};

pub const COLLECTION_LOG_DEFAULT_RULE: SetRule = SetRule {
    read: Controllers,
    write: Controllers,
    memory: Some(Memory::Stable),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: Some(100),
    max_changes_per_user: None,
    version: None,
    rate_config: None,
};

pub const COLLECTION_USER_USAGE_DEFAULT_RULE: SetRule = SetRule {
    read: Controllers,
    write: Controllers,
    memory: Some(Memory::Stable),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: None,
    max_changes_per_user: None,
    version: None,
    rate_config: None,
};

pub const COLLECTION_USER_WEBAUTHN_DEFAULT_RULE: SetRule = SetRule {
    // ℹ️ Public because this is required to retrieve the public key for the passkey
    // when users sign in again through navigator.credentials.get. Public keys are by definition
    // public, and the rawId is the unique identifier provided by WebAuthn, which is not secret by definition either.
    read: Public,
    // ❗Managed, BUT an assertion prevents it to be edited.
    write: Managed,
    memory: Some(Memory::Stable),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: None,
    max_changes_per_user: None,
    version: None,
    rate_config: None,
};

pub const COLLECTION_USER_WEBAUTHN_INDEX_DEFAULT_RULE: SetRule = SetRule {
    // Created and read through internal hooks. We do not have an assertion at the moment that would
    // prevent a controller to set the document themselves.
    read: Controllers,
    write: Controllers,
    memory: Some(Memory::Stable),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: None,
    max_changes_per_user: None,
    version: None,
    rate_config: None,
};

pub const DEFAULT_DB_COLLECTIONS: [(&str, SetRule); 5] = [
    (COLLECTION_USER_KEY, COLLECTION_USER_DEFAULT_RULE),
    (COLLECTION_LOG_KEY, COLLECTION_LOG_DEFAULT_RULE),
    (
        COLLECTION_USER_USAGE_KEY,
        COLLECTION_USER_USAGE_DEFAULT_RULE,
    ),
    (
        COLLECTION_USER_WEBAUTHN_KEY,
        COLLECTION_USER_WEBAUTHN_DEFAULT_RULE,
    ),
    (
        COLLECTION_USER_WEBAUTHN_INDEX_KEY,
        COLLECTION_USER_WEBAUTHN_INDEX_DEFAULT_RULE,
    ),
];

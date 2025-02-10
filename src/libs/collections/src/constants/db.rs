use crate::types::interface::SetRule;
use crate::types::rules::Memory;
use crate::types::rules::Permission::{Controllers, Managed};
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;

pub const COLLECTION_USER_KEY: &str = "#user";
pub const COLLECTION_LOG_KEY: &str = "#log";
pub const USER_USAGE_COLLECTION_KEY: &str = "#user-usage";

const COLLECTION_USER_DEFAULT_RULE: SetRule = SetRule {
    read: Managed,
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

pub const DEFAULT_USER_USAGE_RULE: SetRule = SetRule {
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

pub const DEFAULT_DB_COLLECTIONS: [(&str, SetRule); 3] = [
    (COLLECTION_USER_KEY, COLLECTION_USER_DEFAULT_RULE),
    (COLLECTION_LOG_KEY, COLLECTION_LOG_DEFAULT_RULE),
    (USER_USAGE_COLLECTION_KEY, DEFAULT_USER_USAGE_RULE),
];

pub const DB_COLLECTIONS_WITHOUT_USER_USAGE: [&str; 1] = [COLLECTION_LOG_KEY];

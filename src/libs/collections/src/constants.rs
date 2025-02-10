use crate::types::interface::SetRule;
use crate::types::rules::Memory;
use crate::types::rules::Permission::{Controllers, Managed};
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;

pub const SYS_COLLECTION_PREFIX: char = '#';

pub const COLLECTION_USER_KEY: &str = "#user";
pub const LOG_COLLECTION_KEY: &str = "#log";

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

pub const DEFAULT_DB_LOG_RULE: SetRule = SetRule {
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

pub const USER_ADMIN_COLLECTION_KEY: &str = "#user-admin";

pub const DEFAULT_USER_ADMIN_RULE: SetRule = SetRule {
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
    (LOG_COLLECTION_KEY, DEFAULT_DB_LOG_RULE),
    (USER_ADMIN_COLLECTION_KEY, DEFAULT_USER_ADMIN_RULE),
];

pub const DB_COLLECTIONS_NO_USER_USAGE: [&str; 1] = [LOG_COLLECTION_KEY];

pub const ASSET_COLLECTION_KEY: &str = "#dapp";

pub const DEFAULT_ASSETS_COLLECTIONS: [(&str, SetRule); 1] = [(
    ASSET_COLLECTION_KEY,
    SetRule {
        read: Controllers,
        write: Controllers,
        memory: Some(Memory::Heap),
        mutable_permissions: Some(false),
        max_size: None,
        max_capacity: None,
        max_changes_per_user: None,
        version: None,
        rate_config: None,
    },
)];

pub const ASSETS_COLLECTIONS_NO_USER_USAGE: [&str; 1] = [ASSET_COLLECTION_KEY];

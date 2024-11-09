use crate::types::interface::SetRule;
use crate::types::rules::Memory;
use crate::types::rules::Permission::{Controllers, Managed};
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;

pub const SYS_COLLECTION_PREFIX: char = '#';

pub const LOG_COLLECTION_KEY: &str = "#log";

pub const DEFAULT_DB_LOG_RULE: SetRule = SetRule {
    read: Controllers,
    write: Controllers,
    memory: Some(Memory::Stable),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: Some(100),
    version: None,
    rate_config: None,
};

pub const DEFAULT_DB_COLLECTIONS: [(&str, SetRule); 2] = [
    (
        "#user",
        SetRule {
            read: Managed,
            write: Managed,
            memory: Some(Memory::Stable),
            mutable_permissions: Some(false),
            max_size: None,
            max_capacity: None,
            version: None,
            rate_config: Some(DEFAULT_RATE_CONFIG),
        },
    ),
    (LOG_COLLECTION_KEY, DEFAULT_DB_LOG_RULE),
];

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
        version: None,
        rate_config: None,
    },
)];

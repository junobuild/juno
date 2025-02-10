use crate::types::interface::SetRule;
use crate::types::rules::Memory;
use crate::types::rules::Permission::Controllers;

pub const COLLECTION_ASSET_KEY: &str = "#dapp";

const COLLECTION_ASSET_DEFAULT_RULE: SetRule = SetRule {
    read: Controllers,
    write: Controllers,
    memory: Some(Memory::Heap),
    mutable_permissions: Some(false),
    max_size: None,
    max_capacity: None,
    max_changes_per_user: None,
    version: None,
    rate_config: None,
};

pub const DEFAULT_ASSETS_COLLECTIONS: [(&str, SetRule); 1] =
    [(COLLECTION_ASSET_KEY, COLLECTION_ASSET_DEFAULT_RULE)];

pub const ASSETS_COLLECTIONS_WITHOUT_USER_USAGE: [&str; 1] = [COLLECTION_ASSET_KEY];

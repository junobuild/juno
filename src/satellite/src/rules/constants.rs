use crate::rules::types::interface::SetRule;
use crate::rules::types::rules::Memory;
use crate::rules::types::rules::Permission::{Controllers, Managed};

pub const SYS_COLLECTION_PREFIX: char = '#';

pub const DEFAULT_DB_COLLECTIONS: [(&str, SetRule); 1] = [(
    "#user",
    SetRule {
        read: Managed,
        write: Managed,
        memory: Some(Memory::Heap),
        max_size: None,
        updated_at: None,
    },
)];

pub const DEFAULT_ASSETS_COLLECTIONS: [(&str, SetRule); 1] = [(
    "#dapp",
    SetRule {
        read: Controllers,
        write: Controllers,
        memory: Some(Memory::Heap),
        max_size: None,
        updated_at: None,
    },
)];

use crate::rules::types::interface::SetRule;
use crate::rules::types::rules::Permission::{Controllers, Managed, Public};

pub const SYS_COLLECTION_PREFIX: char = '#';

pub const DEFAULT_DB_COLLECTIONS: [(&str, SetRule); 1] = [(
    "#user",
    SetRule {
        read: Managed,
        write: Managed,
        max_size: None,
        updated_at: None,
    },
)];

pub const DEFAULT_ASSETS_FOLDERS: [(&str, SetRule); 1] = [(
    "#dapp",
    SetRule {
        read: Public,
        write: Controllers,
        max_size: None,
        updated_at: None,
    },
)];

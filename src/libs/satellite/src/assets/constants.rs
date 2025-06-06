use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::Memory;
use junobuild_collections::types::rules::Permission::Controllers;

pub const CDN_JUNO_PATH: &str = "/_juno/";

pub const CDN_JUNO_RELEASES_COLLECTION_KEY: &str = "#_juno/releases";

pub const DEFAULT_CDN_JUNO_RELEASES_COLLECTIONS: [(&str, SetRule); 1] = [(
    CDN_JUNO_RELEASES_COLLECTION_KEY,
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

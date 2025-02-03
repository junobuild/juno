use ic_ledger_types::Tokens;
use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::Memory;
use junobuild_collections::types::rules::Permission::Controllers;

// 0.5 ICP
pub const SATELLITE_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(50_000_000);

// 0.5 ICP
pub const ORBITER_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(50_000_000);

// 1 ICP but also the default credit - i.e. a mission control starts with one credit.
// A credit which can be used to start one satellite or one orbiter.
pub const E8S_PER_ICP: Tokens = Tokens::from_e8s(100_000_000);

pub const RELEASES_COLLECTION_KEY: &str = "#releases";

pub const DEFAULT_RELEASES_COLLECTIONS: [(&str, SetRule); 1] = [(
    RELEASES_COLLECTION_KEY,
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

pub const RELEASES_METADATA_JSON: &str = "/releases/metadata.json";

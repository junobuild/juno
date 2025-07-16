use ic_ledger_types::Tokens;

// 0.5 ICP
pub const SATELLITE_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(50_000_000);

// 0.5 ICP
pub const ORBITER_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(50_000_000);

// 1 ICP but also the default credit - i.e. a mission control starts with one credit.
// A credit which can be used to start one satellite or one orbiter.
pub const E8S_PER_ICP: Tokens = Tokens::from_e8s(100_000_000);

pub const RELEASES_METADATA_JSON: &str = "/releases/metadata.json";

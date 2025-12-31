use ic_ledger_types::Tokens;
use junobuild_shared::ledger::types::cycles::CyclesTokens;

// 1.5 ICP roughly 3 T Cycles on Dec. 31, 2025
pub const SATELLITE_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(1_500_000_000);
pub const ORBITER_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(1_500_000_000);
pub const MISSION_CONTROL_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(1_500_000_000);

// We create canister with CREATE_CANISTER_CYCLES + e.g. CREATE_SATELLITE_CYCLES
// 0.5 + 1 = 1.5 T Cycles (minus what's get consumed along the way)
// At the top, we add our platform fees: 1.5 T Cycles
// So, 1.5 + 1.5 = 3 T Cycles = 3_000_000_000_000
pub const SATELLITE_CREATION_FEE_CYCLES: CyclesTokens = CyclesTokens::from_e12s(3_000_000_000_000);
pub const ORBITER_CREATION_FEE_CYCLES: CyclesTokens = CyclesTokens::from_e12s(3_000_000_000_000);
pub const MISSION_CONTROL_CREATION_FEE_CYCLES: CyclesTokens =
    CyclesTokens::from_e12s(3_000_000_000_000);

// 1 ICP but also the default credit - i.e. a mission control starts with one credit.
// A credit which can be used to start one satellite or one orbiter.
pub const E8S_PER_ICP: Tokens = Tokens::from_e8s(100_000_000);

pub const RELEASES_METADATA_JSON: &str = "/releases/metadata.json";

// Default freezing threshold to create Satellites and Mission Controls
pub const FREEZING_THRESHOLD_ONE_YEAR: u32 = 31_104_000;

// Default freezing threshold to create Orbiters
pub const FREEZING_THRESHOLD_THREE_MONTHS: u32 = 7_776_000;

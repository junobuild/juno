use crate::types::state::CyclesMonitoringStrategy::BelowThreshold;
use crate::types::state::{CyclesMonitoringStrategy, CyclesThreshold};

// TODO: define proper default values
pub const DEFAULT_MISSION_CONTROL_STRATEGY: CyclesMonitoringStrategy =
    BelowThreshold(CyclesThreshold {
        min_cycles: 20_025_000_000_000,
        fund_cycles: 250_000_000_000,
    });

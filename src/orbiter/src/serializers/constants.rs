use std::mem::size_of;
use crate::constants::{SERIALIZED_KEY_LENGTH, SERIALIZED_PRINCIPAL_LENGTH};

pub const TIMESTAMP_LENGTH: usize = size_of::<u64>();

// Size of AnalyticKey:
// - collected_at
// - key (String max length KEY_MAX_LENGTH)
pub const ANALYTIC_KEY_MAX_SIZE: usize = TIMESTAMP_LENGTH + SERIALIZED_KEY_LENGTH;

// Size of AnalyticSatelliteKey:
// - Principal to bytes (30 because a principal is max 29 bytes and one byte to save effective length)
// - collected_at
// - key (String max length KEY_MAX_LENGTH)
pub const ANALYTIC_SATELLITE_KEY_MAX_SIZE: usize =
    SERIALIZED_PRINCIPAL_LENGTH + TIMESTAMP_LENGTH + SERIALIZED_KEY_LENGTH;
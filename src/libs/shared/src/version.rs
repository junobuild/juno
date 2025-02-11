use crate::constants_internal::INITIAL_VERSION;
use crate::types::state::{Version, Versioned};

pub fn next_version<T>(current: &Option<T>) -> Version
where
    T: Versioned,
{
    match current {
        None => INITIAL_VERSION,
        Some(current) => {
            let version = current.version().unwrap_or_default();

            // We reset to zero if the maximum version (u64::MAX) is reached.
            // This is really an edge case—it would take an extremely high number of updates
            // (and therefore a significant amount of cycles) to reach this point.
            // But you never know.
            if version == u64::MAX {
                INITIAL_VERSION
            } else {
                version + 1
            }
        }
    }
}

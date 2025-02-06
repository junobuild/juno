use crate::constants::INITIAL_VERSION;
use crate::types::state::{Version, Versioned};

pub fn next_version<T>(current: &Option<T>) -> Version
where
    T: Versioned,
{
    match current {
        None => INITIAL_VERSION,
        Some(current) => current.version().unwrap_or_default() + 1,
    }
}
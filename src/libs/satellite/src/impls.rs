use crate::memory::internal::init_stable_state;
use crate::types::state::{CollectionType, HeapState, RuntimeState, State};
use std::fmt::{Display, Formatter, Result as FmtResult};

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
            runtime: RuntimeState::default(),
        }
    }
}

impl Display for CollectionType {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(
            f,
            "{}",
            match self {
                CollectionType::Db => "db",
                CollectionType::Storage => "storage",
            }
        )
    }
}

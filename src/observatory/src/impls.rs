use crate::types::state::Archive;
use std::collections::HashMap;

impl Default for Archive {
    fn default() -> Self {
        Archive {
            statuses: HashMap::new(),
        }
    }
}

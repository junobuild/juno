use crate::db::types::state::Doc;
use crate::types::core::Compare;
use std::cmp::Ordering;

impl Compare for Doc {
    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
    }
}

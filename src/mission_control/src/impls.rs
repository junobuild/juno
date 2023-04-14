use crate::types::state::{Archive, ArchiveStatuses, User};
use ic_cdk::api::time;
use shared::types::state::UserId;
use std::collections::{BTreeMap, HashMap};

impl From<&UserId> for User {
    fn from(user: &UserId) -> Self {
        let now = time();

        User {
            user: Some(*user),
            metadata: HashMap::new(),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Archive {
    pub fn new() -> Archive {
        Archive {
            statuses: ArchiveStatuses {
                mission_control: BTreeMap::new(),
                satellites: HashMap::new(),
            },
        }
    }
}

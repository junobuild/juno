use crate::types::state::{Archive, ArchiveStatuses, Orbiter, Satellite, User};
use ic_cdk::api::time;
use shared::types::state::{OrbiterId, SatelliteId, UserId};
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
    pub fn new() -> Self {
        Archive {
            statuses: ArchiveStatuses {
                mission_control: BTreeMap::new(),
                satellites: HashMap::new(),
            },
        }
    }
}

impl Satellite {
    pub fn from(satellite_id: &SatelliteId, name: &str) -> Self {
        let now = time();

        Satellite {
            satellite_id: *satellite_id,
            metadata: HashMap::from([("name".to_string(), name.to_owned())]),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Orbiter {
    pub fn from(orbiter_id: &OrbiterId, name: &str) -> Self {
        let now = time();

        Orbiter {
            orbiter_id: *orbiter_id,
            metadata: HashMap::from([("name".to_string(), name.to_owned())]),
            created_at: now,
            updated_at: now,
        }
    }
}

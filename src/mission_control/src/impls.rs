use crate::types::core::Segment;
use crate::types::state::{Archive, ArchiveStatuses, Orbiter, Satellite, User};
use ic_cdk::api::time;
use shared::types::state::{Metadata, OrbiterId, SatelliteId, UserId};
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
                orbiters: HashMap::new(),
            },
        }
    }
}

fn init_metadata(name: &Option<String>) -> Metadata {
    match name {
        Some(name) => HashMap::from([("name".to_string(), name.to_owned())]),
        None => HashMap::new(),
    }
}

impl Satellite {
    pub fn from(satellite_id: &SatelliteId, name: &Option<String>) -> Self {
        let now = time();

        Satellite {
            satellite_id: *satellite_id,
            metadata: init_metadata(name),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Orbiter {
    pub fn from(orbiter_id: &OrbiterId, name: &Option<String>) -> Self {
        let now = time();

        Orbiter {
            orbiter_id: *orbiter_id,
            metadata: init_metadata(name),
            created_at: now,
            updated_at: now,
        }
    }
}

impl Segment<SatelliteId> for Satellite {
    fn set_metadata(&self, metadata: &Metadata) -> Self {
        let now = time();

        Satellite {
            satellite_id: self.satellite_id,
            metadata: metadata.clone(),
            created_at: self.created_at,
            updated_at: now,
        }
    }
}

impl Segment<OrbiterId> for Orbiter {
    fn set_metadata(&self, metadata: &Metadata) -> Self {
        let now = time();

        Orbiter {
            orbiter_id: self.orbiter_id,
            metadata: metadata.clone(),
            created_at: self.created_at,
            updated_at: now,
        }
    }
}

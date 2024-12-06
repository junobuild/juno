use crate::types::core::Segment;
use crate::types::state::{Archive, ArchiveStatuses, MonitoringStrategy, Orbiter, Orbiters, Satellite, StableState, User};
use ic_cdk::api::time;
use junobuild_shared::types::state::{Metadata, OrbiterId, SatelliteId, UserId};
use std::collections::{BTreeMap, HashMap};

impl From<&UserId> for StableState {
    fn from(user: &UserId) -> Self {
        StableState {
            user: User::from(user),
            satellites: HashMap::new(),
            controllers: HashMap::new(),
            archive: Archive::new(),
            orbiters: Orbiters::new(),
            settings: None,
        }
    }
}

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
            settings: None,
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
            settings: None,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Segment<SatelliteId> for Satellite {
    fn set_metadata(&self, metadata: &Metadata) -> Self {
        let now = time();

        Satellite {
            metadata: metadata.clone(),
            updated_at: now,
            ..self.clone()
        }
    }
}

impl Segment<OrbiterId> for Orbiter {
    fn set_metadata(&self, metadata: &Metadata) -> Self {
        let now = time();

        Orbiter {
            metadata: metadata.clone(),
            updated_at: now,
            ..self.clone()
        }
    }
}

use crate::constants::E8S_PER_ICP;
use crate::types::state::{Account, Provider, Satellite};
use ic_cdk::api::time;
use junobuild_shared::types::state::{Metadata, MissionControlId, SatelliteId, UserId};
use std::collections::HashMap;

impl Account {
    pub fn init(user: &UserId, provider: &Option<Provider>) -> Self {
        let now = time();

        Account {
            mission_control_id: None,
            satellites: None,
            provider: provider.clone(),
            owner: *user,
            credits: E8S_PER_ICP,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn set_provider(&self, provider: &Provider) -> Self {
        Self {
            provider: Some(provider.clone()),
            updated_at: time(),
            ..self.clone()
        }
    }

    pub fn set_mission_control_id(&self, mission_control_id: &MissionControlId) -> Self {
        Self {
            mission_control_id: Some(*mission_control_id),
            updated_at: time(),
            ..self.clone()
        }
    }

    pub fn add_satellite(&mut self, satellite: &Satellite) {
        self.satellites
            .get_or_insert_with(HashMap::new)
            .insert(satellite.satellite_id, satellite.clone());

        self.updated_at = time();
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

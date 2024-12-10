use crate::types::core::{SettingsMonitoring, Segment};
use crate::types::state::CyclesMonitoringStrategy::BelowThreshold;
use crate::types::state::{Archive, ArchiveStatuses, CyclesMonitoring, CyclesMonitoringStrategy, HeapState, MissionControlSettings, Monitoring, Orbiter, Orbiters, Satellite, Settings, User};
use canfund::manager::options::{CyclesThreshold, FundStrategy};
use ic_cdk::api::time;
use junobuild_shared::types::state::{Metadata, OrbiterId, SatelliteId, UserId};
use std::collections::{BTreeMap, HashMap};

impl From<&UserId> for HeapState {
    fn from(user: &UserId) -> Self {
        HeapState {
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

    pub fn clone_with_settings(&self, settings: &Settings) -> Self {
        let now = time();

        Satellite {
            settings: Some(settings.clone()),
            updated_at: now,
            ..self.clone()
        }
    }

    pub fn disable_cycles_monitoring(&self) -> Result<Self, String> {
        let settings = self
            .settings
            .clone()
            .ok_or_else(|| "Settings not found.".to_string())?;

        let monitoring = settings
            .monitoring
            .clone()
            .ok_or_else(|| "Monitoring configuration not found.".to_string())?;

        let cycles = monitoring
            .cycles
            .clone()
            .ok_or_else(|| "Cycles monitoring configuration not found.".to_string())?;

        let now = time();

        Ok(Satellite {
            settings: Some(Settings {
                monitoring: Some(Monitoring {
                    cycles: Some(CyclesMonitoring {
                        enabled: false,
                        ..cycles
                    }),
                    ..monitoring
                }),
                ..settings
            }),
            updated_at: now,
            ..self.clone()
        })
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

    pub fn clone_with_settings(&self, settings: &Settings) -> Self {
        let now = time();

        Orbiter {
            settings: Some(settings.clone()),
            updated_at: now,
            ..self.clone()
        }
    }

    pub fn disable_cycles_monitoring(&self) -> Result<Self, String> {
        let settings = self
            .settings
            .clone()
            .ok_or_else(|| "Settings not found.".to_string())?;

        let monitoring = settings
            .monitoring
            .clone()
            .ok_or_else(|| "Monitoring configuration not found.".to_string())?;

        let cycles = monitoring
            .cycles
            .clone()
            .ok_or_else(|| "Cycles monitoring configuration not found.".to_string())?;

        let now = time();

        Ok(Orbiter {
            settings: Some(Settings {
                monitoring: Some(Monitoring {
                    cycles: Some(CyclesMonitoring {
                        enabled: false,
                        ..cycles
                    }),
                    ..monitoring
                }),
                ..settings
            }),
            updated_at: now,
            ..self.clone()
        })
    }
}

impl Settings {
    pub fn from(strategy: &CyclesMonitoringStrategy) -> Self {
        Settings {
            monitoring: Some(Monitoring::from(strategy)),
        }
    }
}

impl Monitoring {
    pub fn from(strategy: &CyclesMonitoringStrategy) -> Self {
        Monitoring {
            cycles: Some(CyclesMonitoring {
                enabled: true,
                strategy: Some(strategy.clone()),
            })
        }
    }
}

impl SettingsMonitoring for Settings {
    fn monitoring(&self) -> Option<&Monitoring> {
        self.monitoring.as_ref()
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

impl CyclesMonitoringStrategy {
    pub fn to_fund_strategy(&self) -> Result<FundStrategy, String> {
        #[allow(unreachable_patterns)]
        match self {
            BelowThreshold(threshold) => Ok(FundStrategy::BelowThreshold(
                CyclesThreshold::new()
                    .with_min_cycles(threshold.min_cycles)
                    .with_fund_cycles(threshold.fund_cycles),
            )),
            _ => Err("Unsupported cycles monitoring strategy.".to_string()),
        }
    }
}

impl MissionControlSettings {
    pub fn from(strategy: &CyclesMonitoringStrategy) -> Self {
        let now = time();

        MissionControlSettings {
            monitoring: Some(Monitoring::from(strategy)),
            updated_at: now,
            created_at: now,
        }
    }

    pub fn clone_with_strategy(&self, strategy: &CyclesMonitoringStrategy) -> Self {
        let now = time();

        MissionControlSettings {
            monitoring: Some(Monitoring::from(strategy)),
            updated_at: now,
            ..self.clone()
        }
    }

    pub fn disable_cycles_monitoring(&self) -> Result<Self, String> {
        let monitoring = self
            .monitoring
            .clone()
            .ok_or_else(|| "Monitoring configuration not found.".to_string())?;

        let cycles = monitoring
            .cycles
            .clone()
            .ok_or_else(|| "Cycles monitoring configuration not found.".to_string())?;

        let now = time();

        Ok(MissionControlSettings {
            monitoring: Some(Monitoring {
                cycles: Some(CyclesMonitoring {
                    enabled: false,
                    ..cycles
                }),
                ..monitoring
            }),
            updated_at: now,
            ..self.clone()
        })
    }
}

impl SettingsMonitoring for MissionControlSettings {
    fn monitoring(&self) -> Option<&Monitoring> {
        self.monitoring.as_ref()
    }
}

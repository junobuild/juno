use std::collections::HashMap;
use junobuild_shared::types::state::{OrbiterSatelliteConfig, OrbiterSatelliteFeatures, SatelliteId};
use crate::types::state::HeapState;
use crate::upgrade::types::upgrade::UpgradeHeapState;

impl From<&UpgradeHeapState> for HeapState {
    fn from(state: &UpgradeHeapState) -> Self {
        let config: HashMap<SatelliteId, OrbiterSatelliteConfig> = state.config.iter()
            .map(|(id, upgrade_config)| {
                let satellite_config = OrbiterSatelliteConfig {
                    features: match upgrade_config.enabled {
                        true => Some(OrbiterSatelliteFeatures {
                            performance_metrics: true,
                            track_events: true,
                            page_views: true
                        }),
                        false => None
                    },
                    created_at: upgrade_config.created_at,
                    updated_at: upgrade_config.updated_at,
                    version: upgrade_config.version.clone(),
                };
                (*id, satellite_config)
            })
            .collect();

        HeapState {
            controllers: state.controllers.clone(),
            config,
        }
    }
}

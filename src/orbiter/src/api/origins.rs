use crate::config::store::{
    del_satellite_config as del_satellite_config_store, get_satellite_configs,
    set_satellite_config as set_satellite_config_store,
};
use crate::guards::caller_is_admin_controller;
use crate::state::types::state::SatelliteConfigs;
use crate::types::interface::{DelSatelliteConfig, SetSatelliteConfig};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::state::SatelliteId;

#[update(guard = "caller_is_admin_controller")]
fn set_satellite_configs(configs: Vec<(SatelliteId, SetSatelliteConfig)>) -> SatelliteConfigs {
    let mut results: SatelliteConfigs = SatelliteConfigs::new();

    for (satellite_id, config) in configs {
        let result = set_satellite_config_store(&satellite_id, &config).unwrap_or_trap();
        results.insert(satellite_id, result);
    }

    results
}

#[update(guard = "caller_is_admin_controller")]
fn del_satellite_config(satellite_id: SatelliteId, config: DelSatelliteConfig) {
    del_satellite_config_store(&satellite_id, &config).unwrap_or_trap()
}

#[query(guard = "caller_is_admin_controller")]
fn list_satellite_configs() -> SatelliteConfigs {
    get_satellite_configs()
}

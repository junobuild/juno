use crate::state::memory::manager::STATE;
use crate::state::types::state::{SatelliteConfig, SatelliteConfigs};
use crate::types::interface::{DelSatelliteConfig, SetSatelliteConfig};
use ic_cdk::api::time;
use junobuild_shared::assert::assert_version;
use junobuild_shared::types::state::{SatelliteId, Timestamp};
use junobuild_shared::version::next_version;

pub fn set_satellite_config(
    satellite_id: &SatelliteId,
    config: &SetSatelliteConfig,
) -> Result<SatelliteConfig, String> {
    STATE.with(|state| {
        set_satellite_config_impl(satellite_id, config, &mut state.borrow_mut().heap.config)
    })
}

pub fn del_satellite_config(
    satellite_id: &SatelliteId,
    config: &DelSatelliteConfig,
) -> Result<(), String> {
    STATE.with(|state| {
        del_satellite_config_impl(satellite_id, config, &mut state.borrow_mut().heap.config)
    })
}

pub fn get_satellite_config(satellite_id: &SatelliteId) -> Option<SatelliteConfig> {
    STATE.with(|state| {
        let binding = state.borrow();
        let config = binding.heap.config.get(satellite_id);

        config.cloned()
    })
}

pub fn get_satellite_configs() -> SatelliteConfigs {
    STATE.with(|state| state.borrow().heap.config.clone())
}

fn set_satellite_config_impl(
    satellite_id: &SatelliteId,
    config: &SetSatelliteConfig,
    state: &mut SatelliteConfigs,
) -> Result<SatelliteConfig, String> {
    let current_config = state.get(satellite_id);

    // Validate version
    match current_config {
        None => (),
        Some(current_config) => match assert_version(config.version, current_config.version) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    let now = time();

    let created_at: Timestamp = match current_config {
        None => now,
        Some(current_config) => current_config.created_at,
    };

    let version = next_version(&current_config);

    let updated_at: u64 = now;

    let new_config = SatelliteConfig {
        features: config.features.clone(),
        restricted_origin: config.restricted_origin.clone(),
        created_at,
        updated_at,
        version: Some(version),
    };

    state.insert(*satellite_id, new_config.clone());

    Ok(new_config)
}

fn del_satellite_config_impl(
    satellite_id: &SatelliteId,
    config: &DelSatelliteConfig,
    state: &mut SatelliteConfigs,
) -> Result<(), String> {
    let current_config = state.get(satellite_id);

    // Validate version
    match current_config {
        None => (),
        Some(current_config) => match assert_version(config.version, current_config.version) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    state.remove(satellite_id);

    Ok(())
}

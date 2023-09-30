use crate::memory::STATE;
use crate::types::interface::{DelSatelliteConfig, SetSatelliteConfig};
use crate::types::state::{SatelliteConfig, SatelliteConfigs};
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::types::state::SatelliteId;

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

pub fn get_satellite_configs() -> SatelliteConfigs {
    STATE.with(|state| state.borrow().heap.config.clone())
}

fn set_satellite_config_impl(
    satellite_id: &SatelliteId,
    config: &SetSatelliteConfig,
    state: &mut SatelliteConfigs,
) -> Result<SatelliteConfig, String> {
    let current_config = state.get(satellite_id);

    // Validate timestamp
    match current_config {
        None => (),
        Some(current_config) => {
            match assert_timestamp(config.updated_at, current_config.updated_at) {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    let now = time();

    let created_at: u64 = match current_config {
        None => now,
        Some(current_tab) => current_tab.created_at,
    };

    let updated_at: u64 = now;

    let new_config = SatelliteConfig {
        enabled: config.enabled,
        created_at,
        updated_at,
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

    // Validate timestamp
    match current_config {
        None => (),
        Some(current_config) => {
            match assert_timestamp(config.updated_at, current_config.updated_at) {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    state.remove(satellite_id);

    Ok(())
}

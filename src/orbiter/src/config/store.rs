use crate::memory::STATE;
use crate::types::interface::{DelOriginConfig, SetOriginConfig};
use crate::types::state::{OriginConfig, OriginConfigs};
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::types::state::SatelliteId;

pub fn set_origin_config(
    satellite_id: &SatelliteId,
    config: &SetOriginConfig,
) -> Result<OriginConfig, String> {
    STATE.with(|state| {
        set_origin_config_impl(satellite_id, config, &mut state.borrow_mut().heap.origins)
    })
}

pub fn del_origin_config(
    satellite_id: &SatelliteId,
    config: &DelOriginConfig,
) -> Result<(), String> {
    STATE.with(|state| {
        del_origin_config_impl(satellite_id, config, &mut state.borrow_mut().heap.origins)
    })
}

pub fn get_origin_configs() -> OriginConfigs {
    STATE.with(|state| state.borrow().heap.origins.clone())
}

fn set_origin_config_impl(
    satellite_id: &SatelliteId,
    config: &SetOriginConfig,
    state: &mut OriginConfigs,
) -> Result<OriginConfig, String> {
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

    let new_config = OriginConfig {
        key: config.key,
        filter: config.filter.clone(),
        created_at,
        updated_at,
    };

    state.insert(*satellite_id, new_config.clone());

    Ok(new_config)
}

fn del_origin_config_impl(
    satellite_id: &SatelliteId,
    config: &DelOriginConfig,
    state: &mut OriginConfigs,
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

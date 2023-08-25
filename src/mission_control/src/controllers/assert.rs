use shared::ic::segment_status;
use shared::types::state::SatelliteId;

pub async fn assert_satellite_controller(satellite_id: &SatelliteId) -> Result<(), String> {
    let status = segment_status(satellite_id.clone()).await;

    match status {
        Ok(_) => Ok(()),
        Err(_) => Err("Mission control is not a controller of the satellite.".to_string()),
    }
}

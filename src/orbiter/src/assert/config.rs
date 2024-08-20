use crate::memory::STATE;
use crate::msg::ERROR_FEATURE_NOT_ENABLED;
use crate::types::state::SatelliteConfig;
use junobuild_shared::types::state::SatelliteId;

pub fn assert_enabled(satellite_id: &SatelliteId) -> Result<(), String> {
    let config: Option<SatelliteConfig> = STATE.with(|state| {
        let binding = state.borrow();
        let config = binding.heap.config.get(satellite_id);

        config.cloned()
    });

    // Enabling the analytics for a satellite is an opt-in feature
    match config {
        None => {}
        Some(config) => {
            if config.enabled {
                return Ok(());
            }
        }
    }

    Err(ERROR_FEATURE_NOT_ENABLED.to_string())
}

use crate::constants::{KEY_MAX_LENGTH, TRACK_EVENT_METADATA_MAX_LENGTH};
use crate::memory::STATE;
use crate::msg::ERROR_UNAUTHORIZED_CALL;
use crate::types::interface::SetTrackEvent;
use crate::types::state::{AnalyticKey, OriginConfig};
use ic_cdk::caller;
use shared::types::state::SatelliteId;
use shared::utils::principal_equal;

pub fn assert_caller_is_authorized(satellite_id: &SatelliteId) -> Result<(), String> {
    let caller = caller();

    let config: Option<OriginConfig> = STATE.with(|state| {
        let binding = state.borrow();
        let config = binding.heap.origins.get(satellite_id);

        config.cloned()
    });

    match config {
        None => Ok(()),
        Some(config) => {
            if principal_equal(caller, config.key) {
                Ok(())
            } else {
                Err(ERROR_UNAUTHORIZED_CALL.to_string())
            }
        }
    }
}

pub fn assert_analytic_key_length(key: &AnalyticKey) -> Result<(), String> {
    if key.key.len() > usize::try_from(KEY_MAX_LENGTH).unwrap() {
        return Err(format!(
            "An analytic key must not be longer than {}.",
            KEY_MAX_LENGTH
        ));
    }

    if key.session_id.len() > usize::try_from(KEY_MAX_LENGTH).unwrap() {
        return Err(format!(
            "An analytic session ID must not be longer than {}.",
            KEY_MAX_LENGTH
        ));
    }

    Ok(())
}

pub fn assert_task_event_metadata_length(track_event: &SetTrackEvent) -> Result<(), String> {
    match &track_event.metadata {
        None => {}
        Some(metadata) => {
            if metadata.len() > usize::try_from(TRACK_EVENT_METADATA_MAX_LENGTH).unwrap() {
                return Err(format!(
                    "Track event metadata must not contain more than {} elements.",
                    TRACK_EVENT_METADATA_MAX_LENGTH
                ));
            }
        }
    }

    Ok(())
}

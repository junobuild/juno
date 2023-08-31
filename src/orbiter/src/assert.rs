use crate::constants::{
    KEY_MAX_LENGTH, LONG_STRING_MAX_LENGTH, METADATA_MAX_ELEMENTS, STRING_MAX_LENGTH,
};
use crate::memory::STATE;
use crate::msg::ERROR_UNAUTHORIZED_CALL;
use crate::types::interface::{SetPageView, SetTrackEvent};
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
    if key.key.len() > KEY_MAX_LENGTH {
        return Err(format!(
            "An analytic key must not be longer than {}.",
            KEY_MAX_LENGTH
        ));
    }

    if key.session_id.len() > KEY_MAX_LENGTH {
        return Err(format!(
            "An analytic session ID must not be longer than {}.",
            KEY_MAX_LENGTH
        ));
    }

    Ok(())
}

pub fn assert_track_event_length(track_event: &SetTrackEvent) -> Result<(), String> {
    if track_event.name.len() > STRING_MAX_LENGTH {
        return Err(format!(
            "Track event name {} is longer than {}.",
            track_event.name, STRING_MAX_LENGTH
        ));
    }

    match &track_event.metadata {
        None => {}
        Some(metadata) => {
            if metadata.len() > METADATA_MAX_ELEMENTS {
                return Err(format!(
                    "Track event metadata must not contain more than {} elements.",
                    METADATA_MAX_ELEMENTS
                ));
            }

            for (key, value) in metadata.iter() {
                if key.len() > STRING_MAX_LENGTH {
                    return Err(format!(
                        "Track event metadata key {} is longer than {}.",
                        key, STRING_MAX_LENGTH
                    ));
                }

                if value.len() > STRING_MAX_LENGTH {
                    return Err(format!(
                        "Track event metadata value {} is longer than {}.",
                        value, STRING_MAX_LENGTH
                    ));
                }
            }
        }
    }

    Ok(())
}

pub fn assert_page_view_length(page_view: &SetPageView) -> Result<(), String> {
    if page_view.title.len() > STRING_MAX_LENGTH {
        return Err(format!(
            "Page event title {} is longer than {}.",
            page_view.title, STRING_MAX_LENGTH
        ));
    }

    if page_view.href.len() > LONG_STRING_MAX_LENGTH {
        return Err(format!(
            "Page event href {} is longer than {}.",
            page_view.href, STRING_MAX_LENGTH
        ));
    }

    match page_view.referrer.clone() {
        None => {}
        Some(referrer) => {
            if referrer.len() > LONG_STRING_MAX_LENGTH {
                return Err(format!(
                    "Page event referrer {} is longer than {}.",
                    referrer, LONG_STRING_MAX_LENGTH
                ));
            }
        }
    }

    match page_view.user_agent.clone() {
        None => {}
        Some(user_agent) => {
            if user_agent.len() > STRING_MAX_LENGTH {
                return Err(format!(
                    "Page event user_agent {} is longer than {}.",
                    user_agent, STRING_MAX_LENGTH
                ));
            }
        }
    }

    if page_view.time_zone.len() > STRING_MAX_LENGTH {
        return Err(format!(
            "Page event time_zone {} is longer than {}.",
            page_view.time_zone, STRING_MAX_LENGTH
        ));
    }

    Ok(())
}

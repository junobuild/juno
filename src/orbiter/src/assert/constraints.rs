use crate::constants::{
    KEY_MAX_LENGTH, LONG_STRING_MAX_LENGTH, METADATA_MAX_ELEMENTS, SHORT_STRING_MAX_LENGTH,
    STRING_MAX_LENGTH, UTM_MAX_LENGTH,
};
use crate::state::types::state::AnalyticKey;
use crate::types::interface::{SetPageView, SetTrackEvent};
use junobuild_shared::types::state::SatelliteId;
use junobuild_shared::utils::principal_not_equal;

pub fn assert_analytic_key_length(key: &AnalyticKey) -> Result<(), String> {
    if key.key.len() > KEY_MAX_LENGTH {
        return Err(format!(
            "An analytic key must not be longer than {KEY_MAX_LENGTH}."
        ));
    }

    Ok(())
}

pub fn assert_track_event_length(track_event: &SetTrackEvent) -> Result<(), String> {
    assert_session_id_length(&track_event.session_id)?;

    if track_event.name.len() > SHORT_STRING_MAX_LENGTH {
        return Err(format!(
            "Track event name {} is longer than {}.",
            track_event.name, SHORT_STRING_MAX_LENGTH
        ));
    }

    match &track_event.metadata {
        None => {}
        Some(metadata) => {
            if metadata.len() > METADATA_MAX_ELEMENTS {
                return Err(format!(
                    "Track event metadata must not contain more than {METADATA_MAX_ELEMENTS} elements."
                ));
            }

            for (key, value) in metadata.iter() {
                if key.len() > SHORT_STRING_MAX_LENGTH {
                    return Err(format!(
                        "Track event metadata key {key} is longer than {SHORT_STRING_MAX_LENGTH}."
                    ));
                }

                if value.len() > SHORT_STRING_MAX_LENGTH {
                    return Err(format!(
                        "Track event metadata value {value} is longer than {SHORT_STRING_MAX_LENGTH}."
                    ));
                }
            }
        }
    }

    Ok(())
}

pub fn assert_page_view_length(page_view: &SetPageView) -> Result<(), String> {
    assert_session_id_length(&page_view.session_id)?;

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
                    "Page event referrer {referrer} is longer than {LONG_STRING_MAX_LENGTH}."
                ));
            }
        }
    }

    match page_view.user_agent.clone() {
        None => {}
        Some(user_agent) => {
            if user_agent.len() > STRING_MAX_LENGTH {
                return Err(format!(
                    "Page event user_agent {user_agent} is longer than {STRING_MAX_LENGTH}."
                ));
            }
        }
    }

    if page_view.time_zone.len() > SHORT_STRING_MAX_LENGTH {
        return Err(format!(
            "Page event time_zone {} is longer than {}.",
            page_view.time_zone, SHORT_STRING_MAX_LENGTH
        ));
    }

    Ok(())
}

pub fn assert_page_view_campaign_length(page_view: &SetPageView) -> Result<(), String> {
    if let Some(campaign) = &page_view.campaign {
        if campaign.utm_source.len() > UTM_MAX_LENGTH {
            return Err(format!(
                "utm_source {} is longer than {}.",
                campaign.utm_source, UTM_MAX_LENGTH
            ));
        }

        if let Some(medium) = &campaign.utm_medium {
            if medium.len() > UTM_MAX_LENGTH {
                return Err(format!(
                    "utm_medium {medium} is longer than {UTM_MAX_LENGTH}."
                ));
            }
        }

        if let Some(campaign_name) = &campaign.utm_campaign {
            if campaign_name.len() > UTM_MAX_LENGTH {
                return Err(format!(
                    "utm_campaign {campaign_name} is longer than {UTM_MAX_LENGTH}."
                ));
            }
        }

        if let Some(term) = &campaign.utm_term {
            if term.len() > UTM_MAX_LENGTH {
                return Err(format!("utm_term {term} is longer than {UTM_MAX_LENGTH}."));
            }
        }

        if let Some(content) = &campaign.utm_content {
            if content.len() > UTM_MAX_LENGTH {
                return Err(format!(
                    "utm_content {content} is longer than {UTM_MAX_LENGTH}."
                ));
            }
        }
    }

    Ok(())
}

fn assert_session_id_length(session_id: &str) -> Result<(), String> {
    if session_id.len() > KEY_MAX_LENGTH {
        return Err(format!(
            "An analytic session ID must not be longer than {KEY_MAX_LENGTH}."
        ));
    }

    Ok(())
}

pub fn assert_session_id(
    user_session_id: &String,
    current_session_id: &String,
) -> Result<(), String> {
    if user_session_id != current_session_id {
        return Err(format!(
            "Session IDs do not match ({current_session_id} - {user_session_id})"
        ));
    }

    Ok(())
}

pub fn assert_satellite_id(
    user_satellite_id: SatelliteId,
    current_satellite_id: SatelliteId,
) -> Result<(), String> {
    if principal_not_equal(user_satellite_id, current_satellite_id) {
        return Err(format!(
            "Satellite IDs do not match ({} - {})",
            user_satellite_id.to_text(),
            current_satellite_id.to_text()
        ));
    }

    Ok(())
}

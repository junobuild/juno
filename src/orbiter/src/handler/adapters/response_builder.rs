use crate::config::store::get_satellite_config;
use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::response::ApiResponse;
use crate::msg::ERROR_FEATURE_DISABLED;
use crate::types::interface::http::SatelliteIdText;
use candid::Principal;
use ic_http_certification::StatusCode;
use serde::Serialize;

pub fn build_payload_response<T: Serialize>(
    payload: T,
    satellite_id_text: &SatelliteIdText,
) -> Result<HandledUpdateResult, String> {
    let satellite_id = Principal::from_text(satellite_id_text).map_err(|e| e.to_string())?;

    let config = get_satellite_config(&satellite_id);

    if config.is_none() {
        // Technically we should never reach this point as building the payload response is used after
        // entries have been asserted before being persisted.
        return Err(ERROR_FEATURE_DISABLED.to_string());
    }

    let restricted_origin = config.unwrap().restricted_origin.unwrap_or("*".to_string());

    let body = ApiResponse::<T>::ok(&payload).encode();

    let response = HandledUpdateResult::new(StatusCode::OK, body, Some(restricted_origin));

    Ok(response)
}

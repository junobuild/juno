use candid::Principal;
use ic_http_certification::{HeaderField, StatusCode};
use crate::config::store::get_satellite_config;
use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::interface::{ApiResponse, ResponseHeaders};
use crate::msg::ERROR_FEATURE_DISABLED;

pub fn build_payload_response<T>(payload: T, satellite_id: &Principal) -> Result<HandledUpdateResult, String> {
    let config = get_satellite_config(satellite_id);
    
    if config.is_none() {
        // Technically we should never reach this point as building the payload response is used after
        // entries have been asserted before being persisted.
        return Err(ERROR_FEATURE_DISABLED.to_string());
    }
    
    let restricted_origin = config.unwrap().restricted_origin.unwrap_or("*".to_string());
    let headers: [HeaderField; 1] = [("Access-Control-Allow-Origin".to_string(), restricted_origin)];

    let body = ApiResponse::ok(&payload).encode();

    let response = HandledUpdateResult::new(StatusCode::OK, body, Some(headers.to_vec()));
    
    Ok(response)
}
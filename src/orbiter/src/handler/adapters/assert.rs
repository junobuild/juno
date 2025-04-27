use crate::config::store::get_satellite_config;
use crate::http::types::request::HttpRequestBody;
use crate::msg::ERROR_EMPTY_PAYLOAD;
use crate::state::types::state::SatelliteConfig;
use crate::types::interface::http::SetRequest;
use candid::Principal;
use junobuild_utils::decode_doc_data;
use serde::Deserialize;

pub fn assert_request<T>(
    body: &HttpRequestBody,
    feature_check: fn(&Option<SatelliteConfig>) -> Result<(), String>,
) -> Result<(), String>
where
    T: SetRequest + for<'de> Deserialize<'de>,
{
    let request_payload = decode_doc_data::<T>(body)?;

    assert_request_feature_enabled::<T>(&request_payload, feature_check)?;

    if request_payload.empty_payload() {
        return Err(ERROR_EMPTY_PAYLOAD.to_string());
    }

    Ok(())
}

fn assert_request_feature_enabled<T>(
    request_payload: &T,
    feature_check: fn(&Option<SatelliteConfig>) -> Result<(), String>,
) -> Result<(), String>
where
    T: SetRequest,
{
    let principal =
        Principal::from_text(request_payload.satellite_id()).map_err(|e| e.to_string())?;

    feature_check(&get_satellite_config(&principal))
}

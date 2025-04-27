use crate::config::store::get_satellite_config;
use crate::http::types::request::HttpRequestBody;
use crate::state::types::state::SatelliteConfig;
use crate::types::interface::http::SetRequest;
use candid::Principal;
use junobuild_utils::decode_doc_data;
use serde::Deserialize;

pub fn assert_request_feature_enabled<T>(
    body: &HttpRequestBody,
    feature_check: fn(&Option<SatelliteConfig>) -> Result<(), String>,
) -> Result<(), String>
where
    T: SetRequest + for<'de> Deserialize<'de>,
{
    let request_payload = decode_doc_data::<T>(body)?;

    let principal =
        Principal::from_text(request_payload.satellite_id()).map_err(|e| e.to_string())?;

    feature_check(&get_satellite_config(&principal))
}

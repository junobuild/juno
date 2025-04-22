use ic_http_certification::HttpRequest;
use serde::Deserialize;
use crate::assert::config::assert_page_views_enabled;
use crate::events::store::{get_satellite_config, insert_page_view};
use crate::types::interface::PageView;

pub fn handle_http_request(request: &HttpRequest) -> Result<Vec<u8>, String> {
    let PageView {key, page_view}: PageView = json_decode(request.body());

    assert_page_views_enabled(&get_satellite_config(&page_view.satellite_id))?;

    let persisted_page_view = insert_page_view(key, page_view)?;

    serde_json::to_vec(&persisted_page_view).map_err(|e| e.to_string())
}

fn json_decode<T>(value: &[u8]) -> T
where
    T: for<'de> Deserialize<'de>,
{
    serde_json::from_slice(value).expect("Failed to deserialize value")
}
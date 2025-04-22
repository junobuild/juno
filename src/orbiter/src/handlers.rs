use crate::assert::config::assert_page_views_enabled;
use crate::events::store::{get_satellite_config, insert_page_view};
use crate::state::types::state::{AnalyticKey, PageView};
use crate::types::interface::{PageViewPayload, SetPageView};
use ic_http_certification::HttpRequest;

pub fn handle_http_request_update(request: &HttpRequest) -> Result<Vec<u8>, String> {
    let PageViewPayload { key, page_view }: PageViewPayload =
        serde_json::from_slice(request.body()).map_err(|e| e.to_string())?;

    let result = handle_set_page_view(key, page_view);

    serde_json::to_vec(&result).map_err(|e| e.to_string())
}

pub fn handle_set_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    assert_page_views_enabled(&get_satellite_config(&page_view.satellite_id))?;

    insert_page_view(key, page_view)
}

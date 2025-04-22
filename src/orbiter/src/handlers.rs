use crate::events::helpers::assert_and_insert_set_page_view;
use crate::state::types::state::PageView;
use crate::types::interface::PageViewPayload;
use ic_http_certification::HttpRequest;

pub fn handle_http_request_update(request: &HttpRequest) -> Result<PageView, String> {
    let PageViewPayload { key, page_view }: PageViewPayload =
        serde_json::from_slice(request.body()).map_err(|e| e.to_string())?;

    assert_and_insert_set_page_view(key, page_view)
}

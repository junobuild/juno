use crate::events::helpers::assert_and_insert_page_view;
use crate::handler::adapters::response_builder::build_payload_response;
use crate::http::types::handler::HandledUpdateResult;
use crate::http::types::request::HttpRequestBody;
use crate::state::types::state::AnalyticKey;
use crate::types::interface::http::{
    PageViewPayload, SetPageViewPayload, SetPageViewRequest, SetPageViewsRequest,
    SetPageViewsRequestEntry,
};
use ic_http_certification::StatusCode;
use junobuild_utils::decode_doc_data;

pub fn handle_insert_page_view(
    body: &HttpRequestBody,
) -> Result<HandledUpdateResult, (StatusCode, String)> {
    let SetPageViewRequest {
        key,
        page_view,
        satellite_id,
    }: SetPageViewRequest = decode_doc_data::<SetPageViewRequest>(body)
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    let inserted_page_view = assert_and_insert_page_view(
        key.into_domain(),
        SetPageViewPayload::convert_to_setter(page_view, &satellite_id)
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?,
    )
    .map_err(|e| (StatusCode::FORBIDDEN, e.to_string()))?;

    let payload = PageViewPayload::from_domain(inserted_page_view);

    build_payload_response(payload, &satellite_id)
}

pub fn handle_insert_page_views(
    body: &HttpRequestBody,
) -> Result<HandledUpdateResult, (StatusCode, String)> {
    let page_views: SetPageViewsRequest = decode_doc_data::<SetPageViewsRequest>(body)
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for SetPageViewsRequestEntry { key, page_view } in page_views.page_views {
        let key_domain = key.into_domain();

        let result = assert_and_insert_page_view(
            key_domain.clone(),
            SetPageViewPayload::convert_to_setter(page_view, &page_views.satellite_id)
                .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?,
        );

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key_domain, err)),
        }
    }

    if !errors.is_empty() {
        let error_string = errors
            .into_iter()
            .map(|(key, err)| format!("{}: {}", key.key, err))
            .collect::<Vec<_>>()
            .join(", ");

        return Err((StatusCode::FORBIDDEN, error_string));
    }

    build_payload_response((), &page_views.satellite_id)
}

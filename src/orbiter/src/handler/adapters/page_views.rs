use crate::events::helpers::assert_and_insert_page_view;
use crate::state::types::state::AnalyticKey;
use crate::types::interface::http::{PageViewPayload, SetPageViewRequest, SetPageViewsRequest};
use ic_http_certification::HttpRequest;
use junobuild_utils::decode_doc_data;
use crate::handler::adapters::response_builder::build_payload_response;
use crate::http::types::handler::HandledUpdateResult;

pub fn handle_insert_page_view(request: &HttpRequest) -> Result<HandledUpdateResult, String> {
    let SetPageViewRequest { key, page_view }: SetPageViewRequest =
        decode_doc_data::<SetPageViewRequest>(request.body()).map_err(|e| e.to_string())?;
    
    let satellite_id = page_view.satellite_id.value.clone();

    let inserted_page_view = assert_and_insert_page_view(
        key.into_domain(),
        page_view.into_domain().map_err(|e| e.to_string())?,
    )?;

    let payload = PageViewPayload::from_domain(inserted_page_view);

    build_payload_response(payload, &satellite_id)
}

pub fn handle_insert_page_views(request: &HttpRequest) -> Result<(), String> {
    let page_views: SetPageViewsRequest =
        decode_doc_data::<SetPageViewsRequest>(request.body()).map_err(|e| e.to_string())?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for SetPageViewRequest { key, page_view } in page_views {
        let key_domain = key.into_domain();

        let result = assert_and_insert_page_view(
            key_domain.clone(),
            page_view.into_domain().map_err(|e| e.to_string())?,
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

        return Err(error_string);
    }

    Ok(())
}

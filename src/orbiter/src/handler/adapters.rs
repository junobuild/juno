use crate::events::helpers::assert_and_insert_page_view;
use crate::state::types::state::{AnalyticKey, PageView};
use crate::types::interface::{PageViewPayload, PageViewsPayload};
use ic_http_certification::HttpRequest;
use junobuild_utils::decode_doc_data;

pub fn handle_insert_page_view(request: &HttpRequest) -> Result<PageView, String> {
    let PageViewPayload { key, page_view }: PageViewPayload =
        decode_doc_data::<PageViewPayload>(&request.body()).map_err(|e| e.to_string())?;

    assert_and_insert_page_view(key, page_view)
}

pub fn handle_insert_page_views(request: &HttpRequest) -> Result<(), String> {
    let page_views: PageViewsPayload =
        decode_doc_data::<PageViewsPayload>(&request.body()).map_err(|e| e.to_string())?;

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for PageViewPayload { key, page_view } in page_views {
        let result = assert_and_insert_page_view(key.clone(), page_view);

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key, err)),
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

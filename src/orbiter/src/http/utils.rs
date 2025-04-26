use crate::http::types::interface::ResponseBody;
use ic_http_certification::{HttpResponse, StatusCode};
use junobuild_shared::types::core::DomainName;

pub fn create_json_response(
    status_code: StatusCode,
    body: ResponseBody,
    restricted_origin: Option<DomainName>,
) -> HttpResponse<'static> {
    HttpResponse::builder()
        .with_status_code(status_code)
        .with_headers(vec![
            ("content-type".to_string(), "application/json".to_string()),
            (
                "Strict-Transport-Security".to_string(),
                "max-age=31536000 ; includeSubDomains".to_string(),
            ),
            ("X-Content-Type-Options".to_string(), "nosniff".to_string()),
            ("Referrer-Policy".to_string(), "no-referrer".to_string()),
            (
                "cache-control".to_string(),
                "no-store, max-age=0".to_string(),
            ),
            ("pragma".to_string(), "no-cache".to_string()),
            (
                "Access-Control-Allow-Origin".to_string(),
                restricted_origin.unwrap_or("*".to_string()).to_string(),
            ),
        ])
        .with_body(body)
        .build()
}

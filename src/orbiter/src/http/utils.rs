use ic_http_certification::{HttpResponse, StatusCode};

pub fn create_json_response(status_code: StatusCode, body: Vec<u8>) -> HttpResponse<'static> {
    
    ic_cdk::print("DA FUQ!!!!!!");
    
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
            ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
        ])
        .with_body(body)
        .build()
}

pub fn create_cors_preflight_response() -> HttpResponse<'static> {
    HttpResponse::builder()
        .with_status_code(StatusCode::NO_CONTENT)
        .with_headers(vec![
            ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
            ("Access-Control-Allow-Methods".to_string(), "GET, POST, OPTIONS".to_string()),
            ("Access-Control-Allow-Headers".to_string(), "Content-Type".to_string()),
        ])
        .with_body(vec![])
        .build()
}
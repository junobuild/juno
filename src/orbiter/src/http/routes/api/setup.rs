use crate::http::routes::api::types::{CertifiedCelExprDef, CertifiedExactRoute};
use ic_http_certification::{DefaultCelBuilder, DefaultFullCelExpression, DefaultResponseCertification, DefaultResponseOnlyCelExpression, HttpCertificationPath};

pub fn build_full_certified_exact_route(path: &'static str) -> CertifiedExactRoute {
    // define a full CEL expression that will certify the following:
    // - request
    //   - method
    //   - body
    //   - no headers
    //   - no query parameters
    // - response
    //   - status code
    //   - body
    //   - all headers
    // this CEL expression will be used for all routes except for the not found route
    let expr_def = build_full_cel_expression();

    CertifiedExactRoute {
        path: path.to_string(),
        tree_path: HttpCertificationPath::exact(path),
        cel_expr: expr_def.to_string(),
        cel_expr_def: CertifiedCelExprDef::Full(expr_def),
    }
}

pub fn build_response_only_certified_exact_route(path: &'static str) -> CertifiedExactRoute {
    // define a response-only CEL expression that will certify the following:
    // - response
    //   - status code
    //   - body
    //   - all headers
    // this CEL expression will be used for the not found route
    let expr_def = build_response_only_cel_expression();

    CertifiedExactRoute {
        path: path.to_string(),
        tree_path: HttpCertificationPath::exact(path),
        cel_expr: expr_def.to_string(),
        cel_expr_def: CertifiedCelExprDef::ResponseOnly(expr_def),
    }
}

fn build_full_cel_expression() -> DefaultFullCelExpression<'static> {
    DefaultCelBuilder::full_certification()
        .with_request_headers(vec![])
        .with_request_query_parameters(vec![])
        .with_response_certification(DefaultResponseCertification::response_header_exclusions(
            vec![],
        ))
        .build()
}

fn build_response_only_cel_expression() -> DefaultResponseOnlyCelExpression<'static> {
    DefaultCelBuilder::response_only_certification()
        .with_response_certification(DefaultResponseCertification::response_header_exclusions(
            vec![],
        ))
        .build()
}
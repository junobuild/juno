use crate::http::constants::{EVENTS_PATH, EVENT_PATH, VIEWS_PATH, VIEW_PATH};
use crate::http::routes::services::prepare_certified_response;
use crate::http::routes::setup::build_certified_exact_route;
use crate::http::routes::types::CertifiedExactRoute;
use crate::http::state::store::insert_certified_response;
use crate::http::state::types::CertifiedHttpResponse;
use crate::http::types::interface::ErrorResponse;
use crate::http::utils::create_json_response;
use ic_http_certification::{
    HttpCertification, HttpCertificationPath, HttpRequest, HttpResponse, Method, StatusCode,
    CERTIFICATE_EXPRESSION_HEADER_NAME,
};
use lazy_static::lazy_static;

lazy_static! {
    static ref VIEW_ROUTE: CertifiedExactRoute = build_certified_exact_route(VIEW_PATH);
    static ref VIEWS_ROUTE: CertifiedExactRoute = build_certified_exact_route(VIEWS_PATH);
    static ref EVENT_ROUTE: CertifiedExactRoute = build_certified_exact_route(EVENT_PATH);
    static ref EVENTS_ROUTE: CertifiedExactRoute = build_certified_exact_route(EVENTS_PATH);
}

pub fn init_certified_not_allowed_responses() {
    init_not_allowed_responses(&VIEW_ROUTE);
    init_not_allowed_responses(&VIEWS_ROUTE);
    init_not_allowed_responses(&EVENT_ROUTE);
    init_not_allowed_responses(&EVENTS_ROUTE);
}

pub fn init_not_allowed_responses(
    CertifiedExactRoute {
        path,
        tree_path: _,
        cel_expr,
        cel_expr_def,
    }: &CertifiedExactRoute,
) {
    [
        Method::GET,
        Method::DELETE,
        Method::HEAD,
        Method::PUT,
        Method::PATCH,
        Method::OPTIONS,
        Method::TRACE,
        Method::CONNECT,
    ]
    .into_iter()
    .for_each(|method| {
        let request = HttpRequest::builder()
            .with_method(method.clone())
            .with_url(path)
            .build();

        let body = ErrorResponse::not_allowed().encode();
        let mut response = create_json_response(StatusCode::METHOD_NOT_ALLOWED, body);

        // insert the `Ic-CertificationExpression` header with the stringified CEL expression as its value
        response.add_header((
            CERTIFICATE_EXPRESSION_HEADER_NAME.to_string(),
            cel_expr.to_string(),
        ));

        // create the certification for this response and CEL expression pair
        let certification =
            HttpCertification::full(cel_expr_def, &request, &response, None).unwrap();

        let certified_response: CertifiedHttpResponse = CertifiedHttpResponse {
            response,
            certification,
        };

        // TODO: we probably can do this only once
        let tree_path = HttpCertificationPath::exact(path);

        insert_certified_response(
            &path.to_string(),
            &Some(method.to_string()),
            &tree_path,
            &certified_response,
        );
    });
}

pub fn prepare_certified_not_allowed_response(
    request_path: &str,
    certified_response: CertifiedHttpResponse<'static>,
) -> Result<HttpResponse<'static>, String> {
    match request_path {
        VIEW_PATH => {
            prepare_certified_response(request_path, certified_response, &VIEW_ROUTE.tree_path)
        }
        VIEWS_PATH => {
            prepare_certified_response(request_path, certified_response, &VIEWS_ROUTE.tree_path)
        }
        EVENT_PATH => {
            prepare_certified_response(request_path, certified_response, &EVENT_ROUTE.tree_path)
        }
        EVENTS_PATH => {
            prepare_certified_response(request_path, certified_response, &EVENTS_ROUTE.tree_path)
        }
        _ => Err(
            "Unknown request path to prepare not allowed response. This is unexpected".to_string(),
        ),
    }
}

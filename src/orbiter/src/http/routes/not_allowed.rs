use crate::http::constants::{VIEWS_PATH, VIEW_PATH};
use crate::http::routes::services::prepare_certified_response;
use crate::http::state::store::insert_certified_response;
use crate::http::state::types::CertifiedHttpResponse;
use crate::http::types::interface::ErrorResponse;
use crate::http::utils::create_json_response;
use ic_http_certification::{
    DefaultCelBuilder, DefaultFullCelExpression, DefaultResponseCertification, HttpCertification,
    HttpCertificationPath, HttpRequest, HttpResponse, Method, StatusCode,
    CERTIFICATE_EXPRESSION_HEADER_NAME,
};
use lazy_static::lazy_static;

lazy_static! {
    static ref VIEW_TREE_PATH: HttpCertificationPath<'static> =
        HttpCertificationPath::exact(VIEW_PATH);

    static ref VIEWS_TREE_PATH: HttpCertificationPath<'static> =
        HttpCertificationPath::exact(VIEWS_PATH);

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
    static ref VIEW_CEL_EXPR_DEF: DefaultFullCelExpression<'static> = DefaultCelBuilder::full_certification()
        .with_request_headers(vec![])
        .with_request_query_parameters(vec![])
        .with_response_certification(DefaultResponseCertification::response_header_exclusions(
            vec![],
        ))
        .build();
    static ref VIEW_CEL_EXPR: String = VIEW_CEL_EXPR_DEF.to_string();

    static ref VIEWS_CEL_EXPR_DEF: DefaultFullCelExpression<'static> = DefaultCelBuilder::full_certification()
        .with_request_headers(vec![])
        .with_request_query_parameters(vec![])
        .with_response_certification(DefaultResponseCertification::response_header_exclusions(
            vec![],
        ))
        .build();
    static ref VIEWS_CEL_EXPR: String = VIEWS_CEL_EXPR_DEF.to_string();
}

pub fn init_certified_not_allowed_responses() {
    init_not_allowed_responses(VIEW_PATH, &VIEW_CEL_EXPR, &VIEW_CEL_EXPR_DEF);
    init_not_allowed_responses(VIEWS_PATH, &VIEWS_CEL_EXPR, &VIEWS_CEL_EXPR_DEF);
}

pub fn init_not_allowed_responses(
    path: &str,
    cel_expr: &str,
    cel_expr_dev: &DefaultFullCelExpression<'static>,
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
            HttpCertification::full(cel_expr_dev, &request, &response, None).unwrap();

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
        VIEW_PATH => prepare_certified_response(request_path, certified_response, &VIEW_TREE_PATH),
        VIEWS_PATH => {
            prepare_certified_response(request_path, certified_response, &VIEWS_TREE_PATH)
        }
        _ => Err(
            "Unknown request path to prepare not allowed response. This is unexpected".to_string(),
        ),
    }
}

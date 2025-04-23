use crate::http::constants::NOT_FOUND_PATH;
use crate::http::routes::services::prepare_certified_response;
use crate::http::state::store::insert_certified_response;
use crate::http::state::types::CertifiedHttpResponse;
use crate::http::types::interface::ErrorResponse;
use crate::http::utils::create_json_response;
use ic_http_certification::{
    DefaultCelBuilder, DefaultResponseCertification, DefaultResponseOnlyCelExpression,
    HttpCertification, HttpCertificationPath, HttpResponse, StatusCode,
    CERTIFICATE_EXPRESSION_HEADER_NAME,
};
use lazy_static::lazy_static;

lazy_static! {
    static ref NOT_FOUND_TREE_PATH: HttpCertificationPath<'static> =
        HttpCertificationPath::wildcard(NOT_FOUND_PATH);

    // define a response-only CEL expression that will certify the following:
    // - response
    //   - status code
    //   - body
    //   - all headers
    // this CEL expression will be used for the not found route
    static ref NOT_FOUND_CEL_EXPR_DEF: DefaultResponseOnlyCelExpression<'static> = DefaultCelBuilder::response_only_certification()
        .with_response_certification(DefaultResponseCertification::response_header_exclusions(
            vec![],
        ))
        .build();
    static ref NOT_FOUND_CEL_EXPR: String = NOT_FOUND_CEL_EXPR_DEF.to_string();
}

pub fn init_certified_not_found_response() {
    let body = ErrorResponse::not_found().encode();
    let mut response = create_json_response(StatusCode::NOT_FOUND, body);

    // insert the `Ic-CertificationExpression` header with the stringified CEL expression as its value
    response.add_header((
        CERTIFICATE_EXPRESSION_HEADER_NAME.to_string(),
        NOT_FOUND_CEL_EXPR.clone(),
    ));

    // create the certification for this response and CEL expression pair
    let certification =
        HttpCertification::response_only(&NOT_FOUND_CEL_EXPR_DEF, &response, None).unwrap();

    let certified_response: CertifiedHttpResponse = CertifiedHttpResponse {
        response,
        certification,
    };

    let tree_path = HttpCertificationPath::wildcard(NOT_FOUND_PATH);

    insert_certified_response(
        &NOT_FOUND_PATH.to_string(),
        &None,
        &tree_path,
        &certified_response,
    );
}

pub fn prepare_certified_not_found_response(
    request_path: &String,
    certified_response: CertifiedHttpResponse<'static>,
) -> Result<HttpResponse<'static>, String> {
    prepare_certified_response(request_path, certified_response, &NOT_FOUND_TREE_PATH)
}

pub fn create_uncertified_not_found_response() -> HttpResponse<'static> {
    let body = ErrorResponse::not_found().encode();
    create_json_response(StatusCode::NOT_FOUND, body)
}

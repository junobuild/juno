use ic_http_certification::{DefaultCelBuilder, DefaultResponseCertification, DefaultResponseOnlyCelExpression, HttpCertification, StatusCode, CERTIFICATE_EXPRESSION_HEADER_NAME};
use lazy_static::lazy_static;
use crate::http::constants::NOT_FOUND_PATH;
use crate::http::store::insert_certified_response;
use crate::http::types::ErrorResponse;
use crate::http::utils::create_json_response;
use crate::state::types::state::CertifiedHttpResponse;

// ---------------------------------------------------------
// Source for the HTTP implementation:
// https://github.com/dfinity/response-verification/blob/main/examples/http-certification/json-api/src/backend/src/lib.rs
// ---------------------------------------------------------

lazy_static! {
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

pub fn certify_not_found_response() {
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

    insert_certified_response(&NOT_FOUND_PATH, &certified_response);
}
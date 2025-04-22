use ic_http_certification::{HttpCertification, HttpRequest, HttpResponse, StatusCode, CERTIFICATE_EXPRESSION_HEADER_NAME};
use crate::http::builders::create_response;
use crate::http::state::NOT_FOUND_CEL_EXPR;
use crate::http::types::ErrorResponse;

use ic_http_certification::{DefaultCelBuilder, DefaultResponseCertification, DefaultResponseOnlyCelExpression};
use lazy_static::lazy_static;

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

fn on_http_request(request: HttpRequest) -> HttpResponse<'static> {

}

fn certify_not_found_response() {
    let body = ErrorResponse::not_found().encode();
    let mut response = create_response(StatusCode::BAD_REQUEST, body);

    // insert the `Ic-CertificationExpression` header with the stringified CEL expression as its value
    response.add_header((
        CERTIFICATE_EXPRESSION_HEADER_NAME.to_string(),
        NOT_FOUND_CEL_EXPR.clone(),
    ));

    // create the certification for this response and CEL expression pair
    let certification =
        HttpCertification::response_only(&NOT_FOUND_CEL_EXPR_DEF, &response, None).unwrap();


}
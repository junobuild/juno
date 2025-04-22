use crate::http::constants::NOT_FOUND_PATH;
use crate::http::store::insert_certified_response;
use crate::http::types::interface::ErrorResponse;
use crate::http::utils::create_json_response;
use crate::state::services::read_state;
use crate::state::types::state::CertifiedHttpResponse;
use ic_cdk::api::data_certificate;
use ic_http_certification::utils::add_v2_certificate_header;
use ic_http_certification::{
    DefaultCelBuilder, DefaultResponseCertification, DefaultResponseOnlyCelExpression,
    HttpCertification, HttpCertificationPath, HttpCertificationTreeEntry, HttpResponse, StatusCode,
    CERTIFICATE_EXPRESSION_HEADER_NAME,
};
use lazy_static::lazy_static;

// ---------------------------------------------------------
// Source for the HTTP implementation:
// https://github.com/dfinity/response-verification/blob/main/examples/http-certification/json-api/src/backend/src/lib.rs
// ---------------------------------------------------------

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

pub fn prepare_certified_not_found_response(
    request_path: String,
    certified_response: CertifiedHttpResponse<'static>,
) -> Result<HttpResponse<'static>, String> {
    let mut response = certified_response.response.clone();

    let cert = data_certificate();

    if let None = cert {
        return Err("No data certificate available.".to_string());
    }

    read_state(|state| {
        let http_tree = &state.runtime.storage.tree;

        let tree_path = NOT_FOUND_TREE_PATH.to_owned();

        add_v2_certificate_header(
            &cert.unwrap(),
            &mut response,
            &http_tree
                .witness(
                    &HttpCertificationTreeEntry::new(&tree_path, certified_response.certification),
                    &request_path,
                )
                .unwrap(),
            &tree_path.to_expr_path(),
        );
    });

    Ok(response.clone())
}

pub fn create_uncertified_not_found_response() -> HttpResponse<'static> {
    let body = ErrorResponse::not_found().encode();
    create_json_response(StatusCode::NOT_FOUND, body)
}

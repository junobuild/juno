use crate::http::routes::api::types::{CertifiedCelExprDef, CertifiedExactRoute};
use crate::http::state::store::insert_certified_response;
use crate::http::state::types::CertifiedHttpResponse;
use ic_http_certification::{
    HttpCertification, HttpCertificationPath, HttpRequest, HttpResponse, Method,
    CERTIFICATE_EXPRESSION_HEADER_NAME,
};

pub fn init_certified_response(
    CertifiedExactRoute {
        path,
        tree_path: _,
        cel_expr,
        cel_expr_def,
    }: &CertifiedExactRoute,
    method: Method,
    init_response: fn() -> HttpResponse<'static>,
) {
    let mut response = init_response();

    // insert the `Ic-CertificationExpression` header with the stringified CEL expression as its value
    response.add_header((
        CERTIFICATE_EXPRESSION_HEADER_NAME.to_string(),
        cel_expr.to_string(),
    ));

    let request = HttpRequest::builder()
        .with_method(method.clone())
        .with_url(path)
        .build();

    // create the certification for this response and CEL expression pair
    let certification = match cel_expr_def {
        CertifiedCelExprDef::ResponseOnly(cel_expr_def) => HttpCertification::response_only(cel_expr_def, &response, None).unwrap(),
        CertifiedCelExprDef::Full(cel_expr_def) => HttpCertification::full(cel_expr_def, &request, &response, None).unwrap()
    };
    
    let certified_response: CertifiedHttpResponse = CertifiedHttpResponse {
        response,
        certification,
    };

    let tree_path = HttpCertificationPath::exact(path);

    insert_certified_response(
        &path.to_string(),
        &Some(method.to_string()),
        &tree_path,
        &certified_response,
    );
}

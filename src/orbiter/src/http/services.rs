use crate::http::state::services::read_state;
use crate::http::state::types::CertifiedHttpResponse;
use ic_cdk::api::data_certificate;
use ic_http_certification::utils::add_v2_certificate_header;
use ic_http_certification::{HttpCertificationPath, HttpCertificationTreeEntry, HttpResponse};

pub fn prepare_certified_response(
    request_path: &String,
    certified_response: CertifiedHttpResponse<'static>,
    certified_path: &HttpCertificationPath<'static>,
) -> Result<HttpResponse<'static>, String> {
    let mut response = certified_response.response.clone();

    let cert = data_certificate();

    if let None = cert {
        return Err("No data certificate available.".to_string());
    }

    read_state(|state| {
        let http_tree = &state.storage.tree;

        let tree_path = certified_path.to_owned();

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

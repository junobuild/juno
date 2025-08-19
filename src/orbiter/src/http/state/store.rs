use crate::http::state::services::{mutate_state, read_state};
use crate::http::state::types::{CertifiedHttpResponse, StorageRuntimeState};
use crate::http::types::request::{HttpRequestMethod, HttpRequestPath};
use ic_cdk::api::certified_data_set as set_certified_data;
use ic_http_certification::{HttpCertification, HttpCertificationPath, HttpCertificationTreeEntry};

pub fn insert_certified_response(
    path: &HttpRequestPath,
    method: &Option<HttpRequestMethod>,
    tree_path: &HttpCertificationPath,
    response: &CertifiedHttpResponse<'static>,
) {
    mutate_state(|state| {
        // 1. We save the response - header, body, certificate, etc.
        insert_response(&mut state.storage, path, method, response);

        // 2. We validate the response by appending its existence into the certification tree
        certify_response(&mut state.storage, tree_path, &response.certification);
    });
}

pub fn get_certified_response(
    path: &HttpRequestPath,
    method: &Option<HttpRequestMethod>,
) -> Option<CertifiedHttpResponse<'static>> {
    read_state(|state| {
        state
            .storage
            .responses
            .get(&(method.clone(), path.clone()))
            .cloned()
    })
}

fn insert_response(
    storage: &mut StorageRuntimeState,
    path: &HttpRequestPath,
    method: &Option<HttpRequestMethod>,
    response: &CertifiedHttpResponse<'static>,
) {
    storage
        .responses
        .insert((method.clone(), path.clone()), response.clone());
}

fn certify_response(
    storage: &mut StorageRuntimeState,
    tree_path: &HttpCertificationPath,
    certification: &HttpCertification,
) {
    let entry = HttpCertificationTreeEntry::new(tree_path, certification);

    storage.tree.insert(&entry);

    set_certified_data(&storage.tree.root_hash());
}

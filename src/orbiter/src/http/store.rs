use ic_cdk::api::set_certified_data;
use ic_http_certification::{HttpCertification, HttpCertificationPath, HttpCertificationTreeEntry};
use crate::state::services::mutate_state;
use crate::state::types::state::{CertifiedHttpResponse, StorageRuntimeState};

pub fn insert_certified_response(path: &str, response: &CertifiedHttpResponse<'static>, ) {
    mutate_state(|state| {
        // 1. We save the response - header, body, certificate, etc.
        insert_response(&mut state.runtime.storage, path, response);
        
        // 2. We validate the response by appending its existence into the certification tree 
        certify_response(&mut state.runtime.storage, path, &response.certification);
    });
}

fn insert_response(storage: &mut StorageRuntimeState, path: &str, response: &CertifiedHttpResponse<'static>) {
    storage.responses.insert(path.to_string(), response.clone());
}

fn certify_response(storage: &mut StorageRuntimeState, path: &str, certification: &HttpCertification) {
    let tree_path = HttpCertificationPath::wildcard(path);

    let entry = HttpCertificationTreeEntry::new(tree_path, certification);

    storage.tree.insert(&entry);

    set_certified_data(&storage.tree.root_hash());
}
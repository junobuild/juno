use crate::http::types::request::HttpRequestMethod;
use ic_http_certification::{HttpCertification, HttpCertificationTree, HttpResponse};
use std::collections::HashMap;

#[derive(Default, Clone)]
pub struct RuntimeState {
    pub storage: StorageRuntimeState,
}

#[derive(Default, Clone)]
pub struct StorageRuntimeState {
    pub tree: HttpCertificationTree,
    pub responses: HashMap<(Option<HttpRequestMethod>, String), CertifiedHttpResponse<'static>>,
}

#[derive(Debug, Clone)]
pub struct CertifiedHttpResponse<'a> {
    pub response: HttpResponse<'a>,
    pub certification: HttpCertification,
}

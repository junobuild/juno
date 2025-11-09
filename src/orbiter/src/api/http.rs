use crate::handler::dispatcher::Dispatcher;
use crate::http::server::{on_http_request, on_http_request_update};
use ic_cdk_macros::{query, update};
use ic_http_certification::{HttpRequest, HttpResponse};

#[query]
fn http_request(request: HttpRequest) -> HttpResponse<'static> {
    let handler = Dispatcher;
    on_http_request(&request, &handler)
}

#[update]
fn http_request_update(request: HttpRequest) -> HttpResponse<'static> {
    let handler = Dispatcher;
    on_http_request_update(&request, &handler)
}

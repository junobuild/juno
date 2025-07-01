use crate::http::routes::api::init_certified_api_responses;
use crate::http::routes::not_found::init_certified_not_found_response;
use ic_cdk::futures::spawn_017_compat;
use ic_cdk_timers::set_timer;
use std::time::Duration;

pub fn defer_init_certified_responses() {
    set_timer(Duration::ZERO, || {
        spawn_017_compat(init_certified_responses())
    });
}

async fn init_certified_responses() {
    init_certified_api_responses();
    init_certified_not_found_response();
}

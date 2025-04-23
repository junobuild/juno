use crate::http::not_allowed::init_certified_not_allowed_responses;
use crate::http::not_found::init_certified_not_found_response;
use ic_cdk::spawn;
use ic_cdk_timers::set_timer;
use std::time::Duration;

pub fn defer_init_certified_responses() {
    set_timer(Duration::ZERO, || spawn(init_certified_responses()));
}

async fn init_certified_responses() {
    init_certified_not_allowed_responses();
    init_certified_not_found_response();
}

mod cors;
mod init;
mod not_allowed;
mod routes;
pub mod services;
mod setup;
mod types;

use crate::http::routes::api::cors::init_certified_cors_preflight_responses;
use crate::http::routes::api::not_allowed::init_certified_not_allowed_responses;

pub fn init_certified_api_responses() {
    init_certified_not_allowed_responses();
    init_certified_cors_preflight_responses();
}

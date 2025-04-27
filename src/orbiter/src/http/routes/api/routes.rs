use crate::http::constants::{
    EVENTS_PATH, EVENT_PATH, METRICS_PATH, METRIC_PATH, VIEWS_PATH, VIEW_PATH,
};
use crate::http::routes::api::setup::{build_full_certified_exact_route, build_response_only_certified_exact_route};
use crate::http::routes::api::types::CertifiedExactRoute;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref VIEW_FULL_ROUTE: CertifiedExactRoute = build_full_certified_exact_route(VIEW_PATH);
    pub static ref VIEWS_FULL_ROUTE: CertifiedExactRoute = build_full_certified_exact_route(VIEWS_PATH);
    pub static ref EVENT_FULL_ROUTE: CertifiedExactRoute = build_full_certified_exact_route(EVENT_PATH);
    pub static ref EVENTS_FULL_ROUTE: CertifiedExactRoute = build_full_certified_exact_route(EVENTS_PATH);
    pub static ref METRIC_FULL_ROUTE: CertifiedExactRoute = build_full_certified_exact_route(METRIC_PATH);
    pub static ref METRICS_FULL_ROUTE: CertifiedExactRoute = build_full_certified_exact_route(METRICS_PATH);
    
    pub static ref VIEW_RESPONSE_ONLY_ROUTE: CertifiedExactRoute = build_response_only_certified_exact_route(VIEW_PATH);
    pub static ref VIEWS_RESPONSE_ONLY_ROUTE: CertifiedExactRoute = build_response_only_certified_exact_route(VIEWS_PATH);
    pub static ref EVENT_RESPONSE_ONLY_ROUTE: CertifiedExactRoute = build_response_only_certified_exact_route(EVENT_PATH);
    pub static ref EVENTS_RESPONSE_ONLY_ROUTE: CertifiedExactRoute = build_response_only_certified_exact_route(EVENTS_PATH);
    pub static ref METRIC_RESPONSE_ONLY_ROUTE: CertifiedExactRoute = build_response_only_certified_exact_route(METRIC_PATH);
    pub static ref METRICS_RESPONSE_ONLY_ROUTE: CertifiedExactRoute = build_response_only_certified_exact_route(METRICS_PATH);
}

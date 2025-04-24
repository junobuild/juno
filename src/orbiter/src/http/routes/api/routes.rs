use crate::http::constants::{
    EVENTS_PATH, EVENT_PATH, METRICS_PATH, METRIC_PATH, VIEWS_PATH, VIEW_PATH,
};
use crate::http::routes::api::setup::build_certified_exact_route;
use crate::http::routes::api::types::CertifiedExactRoute;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref VIEW_ROUTE: CertifiedExactRoute = build_certified_exact_route(VIEW_PATH);
    pub static ref VIEWS_ROUTE: CertifiedExactRoute = build_certified_exact_route(VIEWS_PATH);
    pub static ref EVENT_ROUTE: CertifiedExactRoute = build_certified_exact_route(EVENT_PATH);
    pub static ref EVENTS_ROUTE: CertifiedExactRoute = build_certified_exact_route(EVENTS_PATH);
    pub static ref METRIC_ROUTE: CertifiedExactRoute = build_certified_exact_route(METRIC_PATH);
    pub static ref METRICS_ROUTE: CertifiedExactRoute = build_certified_exact_route(METRICS_PATH);
}

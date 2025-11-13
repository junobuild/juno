use crate::guards::caller_is_admin_controller;
use crate::store::heap::update_openid_certificate_requests_rate_config;
use crate::types::interface::RateKind;
use ic_cdk_macros::update;
use junobuild_shared::rate::types::RateConfig;

#[update(guard = "caller_is_admin_controller")]
fn update_rate_config(kind: RateKind, config: RateConfig) {
    match kind {
        RateKind::OpenIdCertificateRequests => {
            update_openid_certificate_requests_rate_config(&config)
        }
    }
}

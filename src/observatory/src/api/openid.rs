use crate::guards::caller_is_admin_controller;
use crate::openid::scheduler::{start_openid_scheduler, stop_openid_scheduler};
use crate::store::heap::get_certificate;
use ic_cdk_macros::{query, update};
use junobuild_auth::openid::jkwset::types::interface::GetOpenIdCertificateArgs;
use junobuild_auth::openid::types::provider::OpenIdCertificate;
use junobuild_shared::ic::UnwrapOrTrap;

#[update(guard = "caller_is_admin_controller")]
fn start_openid_monitoring() {
    start_openid_scheduler().unwrap_or_trap()
}

#[update(guard = "caller_is_admin_controller")]
fn stop_openid_monitoring() {
    stop_openid_scheduler().unwrap_or_trap()
}

#[query]
fn get_openid_certificate(
    GetOpenIdCertificateArgs { provider }: GetOpenIdCertificateArgs,
) -> Option<OpenIdCertificate> {
    // TODO: caller rate limiter

    get_certificate(&provider)
}

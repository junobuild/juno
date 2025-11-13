use crate::guards::{
    caller_is_admin_controller, caller_is_not_anonymous, increment_satellites_rate,
};
use crate::openid::scheduler::{start_openid_scheduler, stop_openid_scheduler};
use crate::store::heap::get_certificate;
use ic_cdk_macros::update;
use junobuild_auth::openid::jwkset::types::interface::GetOpenIdCertificateArgs;
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

#[update(guard = "caller_is_not_anonymous")]
fn get_openid_certificate(
    GetOpenIdCertificateArgs { provider }: GetOpenIdCertificateArgs,
) -> Option<OpenIdCertificate> {
    increment_satellites_rate().unwrap_or_trap();

    get_certificate(&provider)
}

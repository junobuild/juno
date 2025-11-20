use crate::memory::state::services::{with_openid, with_openid_mut};
use crate::types::state::OpenId;
use junobuild_auth::openid::jwt::types::cert::Jwks;
use junobuild_auth::openid::types::provider::{OpenIdCertificate, OpenIdProvider};

pub fn get_certificate(provider: &OpenIdProvider) -> Option<OpenIdCertificate> {
    with_openid(|openid| get_certificate_impl(provider, openid))
}

pub fn assert_scheduler_stopped(provider: &OpenIdProvider) -> Result<(), String> {
    with_openid(|openid| assert_scheduler_stopped_impl(provider, openid))
}

pub fn assert_scheduler_running(provider: &OpenIdProvider) -> Result<(), String> {
    with_openid(|openid| assert_scheduler_running_impl(provider, openid))
}

pub fn enable_scheduler(provider: &OpenIdProvider) {
    with_openid_mut(|openid| enable_scheduler_impl(provider, openid))
}

pub fn disable_scheduler(provider: &OpenIdProvider) -> Result<(), String> {
    with_openid_mut(|openid| disable_scheduler_impl(provider, openid))
}

pub fn set_openid_certificate(provider: &OpenIdProvider, jwks: &Jwks) {
    with_openid_mut(|openid| set_openid_certificate_impl(provider, jwks, openid))
}

fn get_certificate_impl(
    provider: &OpenIdProvider,
    openid: &Option<OpenId>,
) -> Option<OpenIdCertificate> {
    openid
        .as_ref()
        .and_then(|openid| openid.certificates.get(provider).cloned())
}

fn assert_scheduler_stopped_impl(
    provider: &OpenIdProvider,
    openid: &Option<OpenId>,
) -> Result<(), String> {
    if scheduler_enabled(openid, provider) {
        return Err(format!("OpenID scheduler for {provider} already running"));
    }

    Ok(())
}

fn assert_scheduler_running_impl(
    provider: &OpenIdProvider,
    openid: &Option<OpenId>,
) -> Result<(), String> {
    if !scheduler_enabled(openid, provider) {
        return Err(format!("OpenID scheduler for {provider} is not running"));
    }

    Ok(())
}

fn scheduler_enabled(openid: &Option<OpenId>, provider: &OpenIdProvider) -> bool {
    openid
        .as_ref()
        .and_then(|openid| openid.schedulers.get(provider))
        .map(|scheduler| scheduler.enabled)
        .unwrap_or(false)
}

fn enable_scheduler_impl(provider: &OpenIdProvider, current_openid: &mut Option<OpenId>) {
    let openid = current_openid.get_or_insert_with(OpenId::default);

    let scheduler = openid.schedulers.entry(provider.clone()).or_default();

    scheduler.enabled = true;
}

fn disable_scheduler_impl(
    provider: &OpenIdProvider,
    openid: &mut Option<OpenId>,
) -> Result<(), String> {
    if let Some(openid) = openid {
        if let Some(cfg) = openid.schedulers.get_mut(provider) {
            cfg.enabled = false;
            return Ok(());
        }

        return Err(format!("Unknown OpenID scheduler for {provider}"));
    }

    Err(format!("OpenID scheduler for {provider} not initialized"))
}

fn set_openid_certificate_impl(
    provider: &OpenIdProvider,
    jwks: &Jwks,
    current_openid: &mut Option<OpenId>,
) {
    let openid = current_openid.get_or_insert_with(OpenId::default);

    openid
        .certificates
        .entry(provider.clone())
        .and_modify(|c| *c = OpenIdCertificate::update(c, jwks))
        .or_insert_with(|| OpenIdCertificate::init(jwks));
}

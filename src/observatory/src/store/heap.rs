use crate::memory::state::services::{
    mutate_heap_state, read_heap_state, with_openid, with_openid_mut,
};
use crate::types::state::{
    ApiKey, Env, HeapState, OpenId, OpenIdCertificate, OpenIdProvider, OpenIdScheduler,
};
use junobuild_auth::openid::jwt::types::cert::Jwks;
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, Controllers, Timestamp};

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    mutate_heap_state(|heap| {
        set_controllers_impl(new_controllers, controller, &mut heap.controllers)
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    mutate_heap_state(|heap| delete_controllers_impl(remove_controllers, &mut heap.controllers))
}

pub fn get_controllers() -> Controllers {
    read_heap_state(|heap| heap.controllers.clone())
}

// ---------------------------------------------------------
// Env
// ---------------------------------------------------------

pub fn set_env(env: &Env) {
    mutate_heap_state(|heap| set_env_impl(env, heap))
}

fn set_env_impl(env: &Env, state: &mut HeapState) {
    state.env = Some(env.clone());
}

pub fn get_email_api_key() -> Result<ApiKey, String> {
    let env = read_heap_state(|heap| heap.env.clone());

    if let Some(env) = env {
        if let Some(email_api_key) = env.email_api_key {
            return Ok(email_api_key);
        }
    }

    Err("No API key is set to send email.".to_string())
}

// ---------------------------------------------------------
// OpenId
// ---------------------------------------------------------

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

pub fn set_openid_certificate(
    provider: &OpenIdProvider,
    jwks: &Jwks,
    expires_at: &Option<Timestamp>,
) {
    with_openid_mut(|openid| set_openid_certificate_impl(provider, jwks, expires_at, openid))
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

    let scheduler = openid
        .schedulers
        .entry(provider.clone())
        .or_insert_with(OpenIdScheduler::default);

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
    expires_at: &Option<Timestamp>,
    current_openid: &mut Option<OpenId>,
) {
    let openid = current_openid.get_or_insert_with(OpenId::default);

    openid
        .certificates
        .entry(provider.clone())
        .and_modify(|c| *c = OpenIdCertificate::update(c, jwks, expires_at))
        .or_insert_with(|| OpenIdCertificate::init(jwks, expires_at));
}

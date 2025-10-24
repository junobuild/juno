use crate::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
use crate::state::types::config::AuthenticationConfig;
use crate::state::types::state::Salt;
use crate::state::types::state::{AuthenticationHeapState, OpenIdCachedCertificate, OpenIdState};
use crate::strategies::AuthHeapStrategy;
use std::collections::hash_map::Entry;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config(auth_heap: &impl AuthHeapStrategy) -> Option<AuthenticationConfig> {
    auth_heap
        .with_auth_state(|authentication| authentication.as_ref().map(|auth| auth.config.clone()))
}

pub fn insert_config(auth_heap: &impl AuthHeapStrategy, config: &AuthenticationConfig) {
    auth_heap.with_auth_state_mut(|authentication| insert_config_impl(config, authentication))
}

fn insert_config_impl(config: &AuthenticationConfig, state: &mut Option<AuthenticationHeapState>) {
    match state {
        None => {
            *state = Some(AuthenticationHeapState {
                config: config.clone(),
                salt: None,
                openid: None,
            })
        }
        Some(state) => state.config = config.clone(),
    }
}

// ---------------------------------------------------------
// Salt
// ---------------------------------------------------------

pub fn get_salt(auth_heap: &impl AuthHeapStrategy) -> Option<Salt> {
    auth_heap.with_auth_state(|authentication| authentication.as_ref().and_then(|auth| auth.salt))
}

pub fn insert_salt(auth_heap: &impl AuthHeapStrategy, salt: &Salt) {
    auth_heap.with_auth_state_mut(|authentication| insert_salt_impl(salt, authentication))
}

fn insert_salt_impl(salt: &Salt, state: &mut Option<AuthenticationHeapState>) {
    match state {
        None => {
            *state = Some(AuthenticationHeapState {
                config: AuthenticationConfig::default(),
                salt: Some(*salt),
                openid: None,
            })
        }
        Some(state) => state.salt = Some(*salt),
    }
}

// ---------------------------------------------------------
// Openid
// ---------------------------------------------------------

pub fn get_openid_state(auth_heap: &impl AuthHeapStrategy) -> Option<OpenIdState> {
    auth_heap.with_auth_state(|authentication| {
        authentication.as_ref().and_then(|auth| auth.openid.clone())
    })
}

pub fn get_cached_certificate(
    provider: &OpenIdProvider,
    auth_heap: &impl AuthHeapStrategy,
) -> Option<OpenIdCachedCertificate> {
    auth_heap
        .with_auth_state(|authentication| get_cached_certificate_impl(provider, authentication))
}

pub fn cache_certificate(
    provider: &OpenIdProvider,
    certificate: &OpenIdCertificate,
    auth_heap: &impl AuthHeapStrategy,
) -> Result<(), String> {
    auth_heap.with_auth_state_mut(|authentication| {
        cache_certificate_impl(provider, certificate, authentication)
    })
}

pub fn record_fetch_attempt(
    provider: &OpenIdProvider,
    reset_streak: bool,
    auth_heap: &impl AuthHeapStrategy,
) {
    auth_heap.with_auth_state_mut(|authentication| {
        record_fetch_attempt_impl(provider, reset_streak, authentication)
    })
}

fn get_cached_certificate_impl(
    provider: &OpenIdProvider,
    state: &Option<AuthenticationHeapState>,
) -> Option<OpenIdCachedCertificate> {
    state
        .as_ref()
        .and_then(|auth| auth.openid.as_ref())
        .and_then(|openid| openid.certificates.get(provider).clone())
        .and_then(|cached| Some(cached.clone()))
}

fn record_fetch_attempt_impl(
    provider: &OpenIdProvider,
    reset_streak: bool,
    state: &mut Option<AuthenticationHeapState>,
) {
    let authentication = state.get_or_insert_with(AuthenticationHeapState::default);
    let openid_state = authentication
        .openid
        .get_or_insert_with(OpenIdState::default);

    openid_state
        .certificates
        .entry(provider.clone())
        .and_modify(|cached_certificate| cached_certificate.record_attempt(reset_streak))
        .or_insert_with(|| OpenIdCachedCertificate::init());
}

fn cache_certificate_impl(
    provider: &OpenIdProvider,
    certificate: &OpenIdCertificate,
    state: &mut Option<AuthenticationHeapState>,
) -> Result<(), String> {
    let authentication = state.get_or_insert_with(AuthenticationHeapState::default);
    let openid_state = authentication
        .openid
        .get_or_insert_with(OpenIdState::default);

    match openid_state.certificates.entry(provider.clone()) {
        Entry::Occupied(mut occ) => {
            occ.get_mut().update_certificate(certificate);
            Ok(())
        }
        Entry::Vacant(_) => Err("Cannot cache certificate: fetch attempt was not recorded".into()),
    }
}

use crate::memory::state::services::{mutate_heap_state, with_rates};
use crate::types::state::{HeapState, OpenIdRequestRate, Rates};
use candid::Principal;
use junobuild_auth::openid::types::provider::OpenIdProvider;

pub fn get_openid_last_request_rate(
    provider: &OpenIdProvider,
    caller: &Principal,
) -> Option<OpenIdRequestRate> {
    with_rates(|rates| get_openid_last_request_rate_impl(provider, caller, rates))
}

fn get_openid_last_request_rate_impl(
    provider: &OpenIdProvider,
    caller: &Principal,
    rates: &Option<Rates>,
) -> Option<OpenIdRequestRate> {
    rates
        .as_ref()
        .and_then(|rates| rates.openid_request_rates.get(provider))
        .and_then(|request_rates| request_rates.get(caller).cloned())
}

pub fn record_request_rate(provider: &OpenIdProvider, caller: &Principal, reset_streak: bool) {
    mutate_heap_state(|state| record_fetch_attempt_impl(provider, caller, reset_streak, state))
}

fn record_fetch_attempt_impl(
    provider: &OpenIdProvider,
    caller: &Principal,
    reset_streak: bool,
    state: &mut HeapState,
) {
    let rates = state.rates.get_or_insert_with(Rates::default);

    rates
        .openid_request_rates
        .entry(provider.clone())
        .or_default()
        .entry(caller.clone())
        .and_modify(|request_rate| request_rate.record_attempt(reset_streak))
        .or_insert_with(OpenIdRequestRate::init);
}

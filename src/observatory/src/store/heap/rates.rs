use crate::memory::state::services::with_rates;
use crate::types::state::{OpenIdLastRequestRate, Rates};
use candid::Principal;
use junobuild_auth::openid::types::provider::OpenIdProvider;

pub fn get_openid_last_request_rate(
    provider: &OpenIdProvider,
    caller: &Principal,
) -> Option<OpenIdLastRequestRate> {
    with_rates(|rates| get_openid_last_request_rate_impl(provider, caller, rates))
}

fn get_openid_last_request_rate_impl(
    provider: &OpenIdProvider,
    caller: &Principal,
    rates: &Option<Rates>,
) -> Option<OpenIdLastRequestRate> {
    rates
        .as_ref()
        .and_then(|rates| rates.openid_request_rates.get(provider))
        .and_then(|request_rates| request_rates.get(caller).cloned())
}

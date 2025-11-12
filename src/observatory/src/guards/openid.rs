use crate::store::heap::{get_openid_request_rate, record_request_rate};
use crate::types::errors::AssertOpenIdRequestRatesError;
use junobuild_auth::asserts::refresh_allowed;
use junobuild_auth::asserts::types::RefreshStatus;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use junobuild_shared::ic::api::caller;

pub fn assert_openid_request_rates(
    provider: &OpenIdProvider,
) -> Result<(), AssertOpenIdRequestRatesError> {
    if !matches!(provider, OpenIdProvider::Google) {
        return Err(AssertOpenIdRequestRatesError::UnknownProvider);
    }

    let caller = caller();

    let last_request_rate = get_openid_request_rate(provider, &caller);

    match refresh_allowed(&last_request_rate) {
        RefreshStatus::AllowedFirstFetch | RefreshStatus::AllowedRetry => {
            record_request_rate(provider, &caller, false);
        }
        RefreshStatus::AllowedAfterCooldown => {
            record_request_rate(provider, &caller, true);
        }
        RefreshStatus::Denied => {
            return Err(AssertOpenIdRequestRatesError::RequestCooldown);
        }
    }

    Ok(())
}

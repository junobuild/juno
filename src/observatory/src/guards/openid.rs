use crate::store::heap::{get_openid_request_rate, record_request_rate};
use junobuild_auth::asserts::refresh_allowed;
use junobuild_auth::asserts::types::RefreshStatus;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use junobuild_shared::ic::api::caller;

pub fn assert_openid_request_rate(provider: &OpenIdProvider) -> Result<(), String> {
    if !matches!(provider, OpenIdProvider::Google) {
        return Err("Unknown OpenID provider".to_string());
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
            return Err("Too many requests".to_string());
        }
    }

    Ok(())
}

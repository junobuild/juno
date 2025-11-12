use crate::store::heap::get_openid_last_request_rate;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use junobuild_shared::ic::api::caller;

pub fn assert_openid_request_rates(provider: &OpenIdProvider) -> Result<(), String> {
    if !matches!(provider, OpenIdProvider::Google) {
        return Err("Unsupported provider.".to_string());
    }

    let caller = caller();

    let last_request_rate = get_openid_last_request_rate(provider, &caller);

    // TODO

    Ok(())
}

use crate::memory::state::services::with_rates_mut;
use crate::types::state::Rates;
use junobuild_shared::rate::utils::increment_and_assert_rate;

pub fn increment_openid_certificate_requests() -> Result<(), String> {
    with_rates_mut(increment_openid_certificate_requests_impl)
}

fn increment_openid_certificate_requests_impl(
    current_rates: &mut Option<Rates>,
) -> Result<(), String> {
    let rates = current_rates.as_mut().ok_or_else(|| {
        "Cannot increment OpenID certificate requests: rates are not configured.".to_string()
    })?;

    let openid_certificate_requests = &mut rates.openid_certificate_requests;

    increment_and_assert_rate(
        &openid_certificate_requests.config,
        &mut openid_certificate_requests.tokens,
    )
}

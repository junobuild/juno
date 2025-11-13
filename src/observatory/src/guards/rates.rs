use crate::memory::state::services::with_rates_mut;
use crate::types::state::Rates;
use junobuild_shared::rate::utils::increment_and_assert_rate;

pub fn increment_satellites_rate() -> Result<(), String> {
    with_rates_mut(increment_satellites_rate_impl)
}

fn increment_satellites_rate_impl(current_rates: &mut Option<Rates>) -> Result<(), String> {
    let rates = current_rates.get_or_insert_with(Rates::default);

    let openid_certificate_requests = &mut rates.openid_certificate_requests;

    increment_and_assert_rate(
        &openid_certificate_requests.config,
        &mut openid_certificate_requests.tokens,
    )
}

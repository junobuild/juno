use crate::memory::state::services::with_rates_mut;
use crate::types::state::Rates;
use junobuild_shared::rate::types::RateConfig;

pub fn update_openid_certificate_requests_rate_config(config: &RateConfig) {
    with_rates_mut(|rates| update_openid_certificate_requests_rate_config_impl(config, rates))
}

fn update_openid_certificate_requests_rate_config_impl(
    config: &RateConfig,
    current_rates: &mut Option<Rates>,
) {
    let rates = current_rates.get_or_insert_with(Rates::default);

    rates.openid_certificate_requests.config = config.clone();
}

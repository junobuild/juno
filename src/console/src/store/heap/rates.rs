use crate::store::services::mutate_heap_state;
use crate::types::state::Rate;
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::rate::utils::increment_and_assert_rate;

pub fn increment_satellites_rate() -> Result<(), String> {
    mutate_heap_state(|heap| increment_rate_impl(&mut heap.rates.satellites))
}

pub fn increment_mission_controls_rate() -> Result<(), String> {
    mutate_heap_state(|heap| increment_rate_impl(&mut heap.rates.mission_controls))
}

pub fn increment_orbiters_rate() -> Result<(), String> {
    mutate_heap_state(|heap| increment_rate_impl(&mut heap.rates.orbiters))
}

fn increment_rate_impl(rate: &mut Rate) -> Result<(), String> {
    increment_and_assert_rate(&rate.config, &mut rate.tokens)
}

pub fn update_satellites_rate_config(config: &RateConfig) {
    mutate_heap_state(|heap| update_rate_config_impl(config, &mut heap.rates.satellites))
}

pub fn update_mission_controls_rate_config(config: &RateConfig) {
    mutate_heap_state(|heap| update_rate_config_impl(config, &mut heap.rates.mission_controls))
}

pub fn update_orbiters_rate_config(config: &RateConfig) {
    mutate_heap_state(|heap| update_rate_config_impl(config, &mut heap.rates.orbiters))
}

fn update_rate_config_impl(config: &RateConfig, rate: &mut Rate) {
    rate.config = config.clone();
}

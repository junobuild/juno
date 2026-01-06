use crate::store::{with_factory_rates, with_factory_rates_mut};
use crate::types::state::{FactoryRate, FactoryRates};
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::rate::utils::increment_and_assert_rate;
use junobuild_shared::types::state::SegmentKind;

pub fn get_factory_rate(segment_kind: &SegmentKind) -> Result<FactoryRate, String> {
    with_factory_rates(|factory_rates| get_factory_rate_impl(segment_kind, factory_rates))
}

fn get_factory_rate_impl(
    segment_kind: &SegmentKind,
    factory_rates: &Option<FactoryRates>,
) -> Result<FactoryRate, String> {
    factory_rates
        .as_ref()
        .and_then(|rates| rates.get(segment_kind))
        .cloned()
        .ok_or_else(|| format!("Rate not found for segment kind: {:?}", segment_kind))
}

pub fn increment_rate(segment_kind: &SegmentKind) -> Result<(), String> {
    with_factory_rates_mut(|factory_rates| increment_rate_impl(segment_kind, factory_rates))
}

fn increment_rate_impl(
    segment_kind: &SegmentKind,
    factory_rates: &mut Option<FactoryRates>,
) -> Result<(), String> {
    let rates = factory_rates
        .as_mut()
        .ok_or_else(|| "Factory rates not initialized".to_string())?;

    let rate = rates
        .get_mut(segment_kind)
        .ok_or_else(|| format!("Rate not initialized for segment kind: {:?}", segment_kind))?;

    increment_and_assert_rate(&rate.config, &mut rate.tokens)
}

pub fn set_factory_rate(segment_kind: &SegmentKind, config: &RateConfig) -> Result<(), String> {
    with_factory_rates_mut(|factory_rates| {
        set_factory_rate_impl(segment_kind, config, factory_rates)
    })
}

fn set_factory_rate_impl(
    segment_kind: &SegmentKind,
    config: &RateConfig,
    factory_rates: &mut Option<FactoryRates>,
) -> Result<(), String> {
    let rates = factory_rates
        .as_mut()
        .ok_or_else(|| "Factory rates not initialized".to_string())?;

    let target = rates
        .get_mut(segment_kind)
        .ok_or_else(|| format!("Rate not initialized for segment kind: {:?}", segment_kind))?;

    target.config = config.clone();

    Ok(())
}

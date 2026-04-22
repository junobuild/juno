use crate::constants::UFO_CREATION_FEE_CYCLES;
use crate::store::mutate_heap_state;
use crate::types::state::{FactoryFee, FactoryFees, FactoryRate, FactoryRates, HeapState};
use ic_cdk::api::time;
use junobuild_shared::ic::api::print;
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::rate::types::RateTokens;
use junobuild_shared::types::state::SegmentKind;

pub fn upgrade_init_ufo_fees_and_rates() {
    mutate_heap_state(|state| {
        upgrade_ufo_fees(&mut state.factory_fees)
            .unwrap_or_else(|err| print(format!("Error upgrading the Ufo fee: {:?}", err)));

        upgrade_ufo_rates(&mut state.factory_rates)
            .unwrap_or_else(|err| print(format!("Error upgrading the Ufo rate: {:?}", err)));
    });
}

fn upgrade_ufo_fees(factory_fees: &mut Option<FactoryFees>) -> Result<(), String> {
    let fees = factory_fees
        .as_mut()
        .ok_or_else(|| "Factory fees not initialized".to_string())?;

    let fee = FactoryFee {
        fee_cycles: UFO_CREATION_FEE_CYCLES,
        fee_icp: None,
        updated_at: time(),
    };

    fees.insert(SegmentKind::Ufo, fee);

    Ok(())
}

fn upgrade_ufo_rates(factory_rates: &mut Option<FactoryRates>) -> Result<(), String> {
    let rates = factory_rates
        .as_mut()
        .ok_or_else(|| "Factory rates not initialized".to_string())?;

    let tokens: RateTokens = RateTokens {
        tokens: 1,
        updated_at: time(),
    };

    let rate = FactoryRate {
        config: DEFAULT_RATE_CONFIG,
        tokens: tokens.clone(),
    };

    rates.insert(SegmentKind::Ufo, rate);

    Ok(())
}

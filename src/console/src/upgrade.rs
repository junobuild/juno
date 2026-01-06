use crate::constants::CANISTER_CREATION_FEE_CYCLES;
use crate::fees::{init_factory_fees, set_factory_fee};
use crate::rates::init::init_factory_rates;
use crate::rates::set_factory_rate;
use crate::store::mutate_heap_state;
use crate::types::interface::FeesArgs;
use crate::types::state::{HeapState};
use junobuild_shared::ic::api::print;
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::types::state::SegmentKind;

pub fn upgrade_init_factory_fees_and_rates() {
    mutate_heap_state(|state| upgrade_init_factory_fees_and_rates_impl(state))
}

fn upgrade_init_factory_fees_and_rates_impl(state: &mut HeapState) {
    state.factory_fees.get_or_insert_with(init_factory_fees);
    state.factory_rates.get_or_insert_with(init_factory_rates);
}

pub fn upgrade_init_canister_fees_and_rates() {
    mutate_heap_state(|state| upgrade_init_factory_fees_and_rates_impl(state));

    // Init fee
    let fee = FeesArgs {
        fee_cycles: CANISTER_CREATION_FEE_CYCLES,
        fee_icp: None,
    };

    set_factory_fee(&SegmentKind::Canister, &fee)
        .unwrap_or_else(|err| print(format!("Error upgrading the Canister fee: {:?}", err)));

    // Init rate
    set_factory_rate(&SegmentKind::Canister, &DEFAULT_RATE_CONFIG)
        .unwrap_or_else(|err| print(format!("Error upgrading the Canister rate: {:?}", err)));
}

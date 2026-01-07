use crate::fees::init_factory_fees;
use crate::rates::init::init_factory_rates;
use crate::store::mutate_heap_state;
use crate::types::state::HeapState;

pub fn upgrade_init_factory_fees_and_rates() {
    mutate_heap_state(|state| upgrade_init_factory_fees_and_rates_impl(state))
}

fn upgrade_init_factory_fees_and_rates_impl(state: &mut HeapState) {
    state.factory_fees.get_or_insert_with(init_factory_fees);
    state.factory_rates.get_or_insert_with(init_factory_rates);
}

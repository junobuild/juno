use crate::fees::init_factory_fees;
use crate::store::mutate_heap_state;
use crate::types::state::HeapState;

pub fn upgrade_init_factory_fees() {
    mutate_heap_state(|state| upgrade_init_factory_fee_impl(state))
}

fn upgrade_init_factory_fee_impl(state: &mut HeapState) {
    state.factory_fees.get_or_insert_with(init_factory_fees);
}

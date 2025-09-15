use crate::store::services::{mutate_heap_state, read_heap_state};
use crate::types::state::{Fee, Fees};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;

pub fn get_satellite_fee() -> Tokens {
    read_heap_state(|heap| heap.fees.satellite.fee)
}

pub fn get_orbiter_fee() -> Tokens {
    read_heap_state(|heap| heap.fees.orbiter.fee)
}

pub fn set_create_satellite_fee(fee: &Tokens) {
    mutate_heap_state(|heap| set_satellite_fee(fee, &mut heap.fees))
}

pub fn set_create_orbiter_fee(fee: &Tokens) {
    mutate_heap_state(|heap| set_orbiter_fee(fee, &mut heap.fees))
}

fn set_satellite_fee(fee: &Tokens, state: &mut Fees) {
    state.satellite = Fee {
        fee: *fee,
        updated_at: time(),
    };
}

fn set_orbiter_fee(fee: &Tokens, state: &mut Fees) {
    state.orbiter = Fee {
        fee: *fee,
        updated_at: time(),
    };
}

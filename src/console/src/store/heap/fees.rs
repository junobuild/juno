use crate::store::{with_fees, with_fees_mut};
use crate::types::state::{Fee, Fees};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;

pub fn get_satellite_fee() -> Tokens {
    with_fees(|fees| fees.satellite.fee)
}

pub fn get_orbiter_fee() -> Tokens {
    with_fees(|fees| fees.orbiter.fee)
}

pub fn set_create_satellite_fee(fee: &Tokens) {
    with_fees_mut(|fees| set_satellite_fee(fee, fees))
}

pub fn set_create_orbiter_fee(fee: &Tokens) {
    with_fees_mut(|fees| set_orbiter_fee(fee, fees))
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

use crate::store::{with_factory_fees, with_factory_fees_mut};
use crate::types::state::{FactoryFee, FactoryFees};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;

pub fn get_satellite_fee() -> Tokens {
    get_fee_impl(|fees| &fees.satellite)
}

pub fn get_orbiter_fee() -> Tokens {
    get_fee_impl(|fees| &fees.orbiter)
}

pub fn get_mission_control_fee() -> Tokens {
    get_fee_impl(|fees| &fees.mission_control)
}

fn get_fee_impl<F>(selector: F) -> Tokens
where
    F: FnOnce(&FactoryFees) -> &FactoryFee,
{
    with_factory_fees(|fees| {
        let default = FactoryFees::default();
        let factory_fees = fees.as_ref().unwrap_or(&default);
        selector(factory_fees).fee_icp
    })
}

pub fn set_create_satellite_fee(fee: &Tokens) {
    set_fee_impl(fee, |fees| &mut fees.satellite)
}

pub fn set_create_orbiter_fee(fee: &Tokens) {
    set_fee_impl(fee, |fees| &mut fees.orbiter)
}

pub fn set_create_mission_control_fee(fee: &Tokens) {
    set_fee_impl(fee, |fees| &mut fees.mission_control)
}

fn set_fee_impl<F>(fee: &Tokens, selector: F)
where
    F: FnOnce(&mut FactoryFees) -> &mut FactoryFee,
{
    with_factory_fees_mut(|state| {
        let factory_fees = state.get_or_insert_with(FactoryFees::default);

        let target = selector(factory_fees);

        target.fee_icp = *fee;
        target.updated_at = time();
    })
}

use crate::memory::STATE;
use candid::Principal;
use getrandom::register_custom_getrandom;
use getrandom::Error;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, spawn};
use ic_cdk_timers::set_timer;
use rand::{rngs::StdRng, RngCore, SeedableRng};
use std::num::NonZeroU32;
use std::time::Duration;

pub fn defer_init_random_seed() {
    set_timer(Duration::ZERO, || spawn(set_random_seed()));
    register_custom_getrandom!(custom_getrandom);
}

async fn set_random_seed() {
    let result: CallResult<([u8; 32],)> =
        call(Principal::management_canister(), "raw_rand", ()).await;

    match result {
        // We do nothing in case of error to not block initialization but, getrandom will throw errors
        Err(_) => (),
        Ok((seed,)) => STATE.with(|state| {
            state.borrow_mut().runtime.rng = Some(StdRng::from_seed(seed));
        }),
    }
}

fn custom_getrandom(buf: &mut [u8]) -> Result<(), Error> {
    STATE.with(|state| {
        let rng = &mut state.borrow_mut().runtime.rng;

        match rng {
            None => Err(Error::from(NonZeroU32::new(Error::CUSTOM_START).unwrap())),
            Some(rng) => {
                rng.fill_bytes(buf);
                Ok(())
            }
        }
    })
}

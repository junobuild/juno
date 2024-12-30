use crate::memory::STATE;
use getrandom::register_custom_getrandom;
use getrandom::Error;
use ic_cdk::spawn;
use ic_cdk_timers::set_timer;
use junobuild_shared::random::get_random_seed;
use rand::RngCore;
use std::num::NonZeroU32;
use std::time::Duration;

pub fn defer_init_random_seed() {
    set_timer(Duration::ZERO, || spawn(set_random_seed()));
    register_custom_getrandom!(custom_getrandom);
}

async fn set_random_seed() {
    let seed = get_random_seed().await;

    STATE.with(|state| {
        state.borrow_mut().runtime.rng = seed;
    });
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

use crate::memory::RUNTIME_STATE;
use getrandom::Error;
use ic_cdk::spawn;
use ic_cdk_timers::set_timer;
use junobuild_shared::random::get_random_seed;
use rand::{Rng, RngCore};
use std::time::Duration;

pub fn defer_init_random_seed() {
    set_timer(Duration::ZERO, || spawn(set_random_seed()));
}

async fn set_random_seed() {
    let seed = get_random_seed().await;

    RUNTIME_STATE.with(|state| {
        state.borrow_mut().rng = seed;
    });
}

/// Source: https://github.com/rust-random/getrandom?tab=readme-ov-file#custom-backend
#[no_mangle]
unsafe extern "Rust" fn __getrandom_v03_custom(dest: *mut u8, len: usize,) -> Result<(), Error> {
    RUNTIME_STATE.with(|state| {
        let rng = &mut state.borrow_mut().rng;

        match rng {
            None => Err(Error::new_custom(0)),
            Some(rng) => {
                let buf: &mut [u8] = unsafe {
                    // fill the buffer with zeros
                    core::ptr::write_bytes(dest, 0, len);
                    // create mutable byte slice
                    core::slice::from_raw_parts_mut(dest, len)
                };

                rng.fill_bytes(buf);
                Ok(())
            }
        }
    })
}

pub fn random() -> Result<i32, String> {
    RUNTIME_STATE.with(|state| {
        let rng = &mut state.borrow_mut().rng;

        match rng {
            None => Err("The random number generator has not been initialized.".to_string()),
            Some(rng) => Ok(rng.random()),
        }
    })
}

use crate::hooks::random::invoke_on_init_random_seed;
use crate::memory::internal::STATE;
use getrandom::Error;
use ic_cdk::futures::spawn;
use ic_cdk_timers::set_timer;
use junobuild_shared::random::get_random_seed;
use rand::RngCore;
use std::time::Duration;

pub fn defer_init_random_seed() {
    set_timer(Duration::ZERO, || spawn(init_random_seed()));
}

async fn init_random_seed() {
    let seed = get_random_seed().await;

    STATE.with(|state| {
        state.borrow_mut().runtime.rng = seed;
    });

    invoke_on_init_random_seed();
}

/// Source: https://github.com/rust-random/getrandom?tab=readme-ov-file#custom-backend
#[no_mangle]
unsafe extern "Rust" fn __getrandom_v03_custom(dest: *mut u8, len: usize) -> Result<(), Error> {
    STATE.with(|state| {
        let rng = &mut state.borrow_mut().runtime.rng;

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

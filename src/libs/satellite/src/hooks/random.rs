#![allow(dead_code)]

#[allow(unused)]
use ic_cdk_timers::set_timer;
#[allow(unused)]
use std::time::Duration;

extern "Rust" {
    fn juno_on_init_random_seed();
}

#[allow(unused_variables)]
pub fn invoke_on_init_random_seed() {
    #[cfg(feature = "on_init_random_seed")]
    {
        unsafe {
            set_timer(Duration::ZERO, || {
                juno_on_init_random_seed();
            });
        }
    }
}

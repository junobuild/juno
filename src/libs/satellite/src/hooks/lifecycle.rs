#![allow(dead_code)]

#[allow(unused)]
use ic_cdk_timers::set_timer;
#[allow(unused)]
use std::time::Duration;

extern "Rust" {
    fn juno_on_init();
    fn juno_on_post_upgrade();

    fn juno_on_init_sync();
    fn juno_on_post_upgrade_sync();
}

#[allow(unused_variables)]
pub fn invoke_on_init() {
    #[cfg(feature = "on_init")]
    {
        unsafe {
            set_timer(Duration::ZERO, || {
                juno_on_init();
            });
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_on_init_sync() {
    #[cfg(feature = "on_init_sync")]
    {
        unsafe {
            juno_on_init_sync();
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_on_post_upgrade() {
    #[cfg(feature = "on_post_upgrade")]
    {
        unsafe {
            set_timer(Duration::ZERO, || {
                juno_on_post_upgrade();
            });
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_on_post_upgrade_sync() {
    #[cfg(feature = "on_post_upgrade_sync")]
    {
        unsafe {
            juno_on_post_upgrade_sync();
        }
    }
}

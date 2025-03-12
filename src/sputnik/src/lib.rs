#![allow(clippy::needless_lifetimes)]

mod errors;
mod hooks;
mod js;
mod polyfill;
mod state;

use junobuild_macros::{on_init_random_seed, on_init_sync, on_post_upgrade_sync};
use junobuild_satellite::include_satellite;
use polyfill::wasi::{init_wasi, update_wasi_seed};

#[on_init_sync]
fn on_init_sync() {
    init_wasi();
}

#[on_post_upgrade_sync]
fn on_post_upgrade_sync() {
    init_wasi();
}

#[on_init_random_seed]
fn on_init_random_seed() -> Result<(), String> {
    update_wasi_seed()
}

include_satellite!();

#![allow(clippy::needless_lifetimes)]

mod errors;
mod hooks;
mod js;
mod polyfill;
mod state;

use junobuild_satellite::include_satellite;

#[ic_cdk::query]
fn sputnik_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

include_satellite!();

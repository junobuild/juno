#![allow(clippy::needless_lifetimes)]

mod errors;
mod js;
mod polyfill;
mod state;

use junobuild_satellite::include_satellite;

include_satellite!();

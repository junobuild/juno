#![allow(clippy::needless_lifetimes)]
#![deny(clippy::disallowed_methods)]

mod errors;
mod hooks;
mod js;
mod polyfill;
mod state;

use junobuild_satellite::include_satellite;

include_satellite!();

#![deny(clippy::disallowed_methods)]

mod assets;

use crate::assets::init_asset;
use junobuild_macros::on_init;
use junobuild_satellite::include_satellite;

#[on_init]
fn on_init() -> Result<(), String> {
    init_asset()
}

include_satellite!();

use junobuild_macros::on_set_doc;
use junobuild_satellite::{include_satellite, OnSetDocContext};

#[on_set_doc]
fn on_set_doc(_context: OnSetDocContext) -> Result<(), String> {
    Ok(())
}

include_satellite!();

use junobuild_macros::on_set_doc;
use junobuild_satellite::{include_satellite, info, OnSetDocContext};

#[on_set_doc]
fn on_set_doc(_context: OnSetDocContext) -> Result<(), String> {
    info("Hello world".to_string())?;
    
    Ok(())
}

include_satellite!();

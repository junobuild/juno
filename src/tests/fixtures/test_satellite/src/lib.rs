use junobuild_macros::{on_set_doc, on_delete_doc};
use junobuild_satellite::{include_satellite, info, error, OnSetDocContext, OnDeleteDocContext};

#[on_set_doc]
fn on_set_doc(_context: OnSetDocContext) -> Result<(), String> {
    info("Hello world".to_string())?;
    
    Ok(())
}

#[on_delete_doc]
fn on_delete_doc(_context: OnDeleteDocContext) -> Result<(), String> {
    error("Delete Hello world".to_string())?;

    Ok(())
}

include_satellite!();

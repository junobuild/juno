use junobuild_macros::{on_delete_doc, on_set_doc, on_init_sync, on_post_upgrade_sync};
use junobuild_satellite::{error, include_satellite, info, warn, OnDeleteDocContext, OnSetDocContext};

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

#[on_init_sync]
fn on_init_sync() -> Result<(), String> {
    warn("On init sync was executed".to_string())?;

    Ok(())
}

#[on_post_upgrade_sync]
fn on_post_upgrade_sync() -> Result<(), String> {
    warn("On post upgrade sync was executed".to_string())?;

    Ok(())
}

include_satellite!();

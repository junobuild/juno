use ic_cdk::{update};
use junobuild_macros::{on_delete_doc, on_init_sync, on_post_upgrade_sync, on_set_doc};
use junobuild_satellite::{error, include_satellite, info, random, OnDeleteDocContext, OnSetDocContext};

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
fn on_init_sync() {
    ic_cdk::print("On init sync was executed");
}

#[on_post_upgrade_sync]
fn on_post_upgrade_sync() {
    ic_cdk::print("On post upgrade sync was executed");
}

#[update]
fn get_random() -> Result<i32, String> {
    random()
}

include_satellite!();

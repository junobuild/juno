use crate::hooks::js::sdk::controllers::init_controllers_sdk;
use crate::hooks::js::sdk::utils::init_utils_sdk;
use db::init_db_sdk;
use rquickjs::{Ctx, Error as JsError};

mod controllers;
mod db;
mod utils;

pub fn init_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_db_sdk(ctx)?;
    init_utils_sdk(ctx)?;
    init_controllers_sdk(ctx)?;

    Ok(())
}

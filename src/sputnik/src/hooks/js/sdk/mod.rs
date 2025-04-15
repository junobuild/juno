mod controllers;
mod db;
mod random;
mod storage;
mod utils;

use crate::hooks::js::sdk::controllers::init_controllers_sdk;
use crate::hooks::js::sdk::random::init_random_sdk;
use crate::hooks::js::sdk::storage::init_storage_sdk;
use crate::hooks::js::sdk::utils::init_utils_sdk;
use db::init_db_sdk;
use rquickjs::{Ctx, Error as JsError};

pub fn init_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_db_sdk(ctx)?;
    init_storage_sdk(ctx)?;
    init_utils_sdk(ctx)?;
    init_controllers_sdk(ctx)?;
    init_random_sdk(ctx)?;

    Ok(())
}

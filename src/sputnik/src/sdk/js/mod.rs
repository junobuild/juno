mod controllers;
mod db;
mod random;
mod storage;
pub mod types;
pub mod types;
mod utils;

use crate::sdk::js::controllers::init_controllers_sdk;
use crate::sdk::js::random::init_random_sdk;
use crate::sdk::js::storage::init_storage_sdk;
use crate::sdk::js::utils::init_utils_sdk;
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

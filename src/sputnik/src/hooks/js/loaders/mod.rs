mod db;
mod storage;

use crate::hooks::js::loaders::db::init_db_loaders;
use crate::hooks::js::loaders::storage::init_storage_loaders;
use rquickjs::{Ctx, Error as JsError};

pub fn init_loaders(ctx: &Ctx) -> Result<(), JsError> {
    init_db_loaders(ctx)?;
    init_storage_loaders(ctx)?;

    Ok(())
}

mod count_assets_store;
mod count_collection_assets_store;

use crate::hooks::js::sdk::storage::count_assets_store::init_count_assets_store;
use crate::hooks::js::sdk::storage::count_collection_assets_store::init_count_collection_assets_store;
use rquickjs::{Ctx, Error as JsError};

pub fn init_storage_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_count_collection_assets_store(ctx)?;
    init_count_assets_store(ctx)?;

    Ok(())
}

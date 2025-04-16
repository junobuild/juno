mod count_assets_store;
mod count_collection_assets_store;
mod set_asset_handler;

use crate::hooks::js::sdk::storage::count_assets_store::init_count_assets_store;
use crate::hooks::js::sdk::storage::count_collection_assets_store::init_count_collection_assets_store;
use crate::hooks::js::sdk::storage::set_asset_handler::init_set_asset_handler;
use rquickjs::{Ctx, Error as JsError};

pub fn init_storage_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_count_collection_assets_store(ctx)?;
    init_count_assets_store(ctx)?;
    init_set_asset_handler(ctx)?;

    Ok(())
}

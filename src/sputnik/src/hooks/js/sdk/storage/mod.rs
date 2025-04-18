mod count_assets_store;
mod count_collection_assets_store;
mod delete_asset_store;
mod delete_assets_store;
mod delete_filtered_assets_store;
mod get_asset_store;
mod get_content_chunks_store;
mod list_assets_store;
mod set_asset_handler;

use crate::hooks::js::sdk::storage::count_assets_store::init_count_assets_store;
use crate::hooks::js::sdk::storage::count_collection_assets_store::init_count_collection_assets_store;
use crate::hooks::js::sdk::storage::delete_asset_store::init_delete_asset_store;
use crate::hooks::js::sdk::storage::delete_assets_store::init_delete_assets_store;
use crate::hooks::js::sdk::storage::delete_filtered_assets_store::init_delete_filtered_assets_store;
use crate::hooks::js::sdk::storage::get_asset_store::init_get_asset_store;
use crate::hooks::js::sdk::storage::get_content_chunks_store::init_get_content_chunks_store;
use crate::hooks::js::sdk::storage::list_assets_store::init_list_assets_store;
use crate::hooks::js::sdk::storage::set_asset_handler::init_set_asset_handler;
use rquickjs::{Ctx, Error as JsError};

pub fn init_storage_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_count_collection_assets_store(ctx)?;
    init_count_assets_store(ctx)?;
    init_set_asset_handler(ctx)?;
    init_delete_asset_store(ctx)?;
    init_delete_assets_store(ctx)?;
    init_delete_filtered_assets_store(ctx)?;
    init_get_asset_store(ctx)?;
    init_list_assets_store(ctx)?;
    init_get_content_chunks_store(ctx)?;

    Ok(())
}

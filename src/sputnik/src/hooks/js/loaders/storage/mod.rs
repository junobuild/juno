mod assert_delete_asset;
mod assert_upload_asset;
mod on_delete_asset;
mod on_delete_filtered_assets;
mod on_delete_many_assets;
mod on_upload_asset;

use crate::hooks::js::loaders::storage::assert_delete_asset::init_assert_delete_asset_loader;
use crate::hooks::js::loaders::storage::assert_upload_asset::init_assert_upload_asset_loader;
use crate::hooks::js::loaders::storage::on_delete_asset::init_on_delete_asset_loader;
use crate::hooks::js::loaders::storage::on_delete_filtered_assets::init_on_delete_filtered_assets_loader;
use crate::hooks::js::loaders::storage::on_delete_many_assets::init_on_delete_many_assets_loader;
use crate::hooks::js::loaders::storage::on_upload_asset::init_on_upload_asset_loader;
use rquickjs::{Ctx, Error as JsError};

pub fn init_storage_loaders(ctx: &Ctx) -> Result<(), JsError> {
    init_on_upload_asset_loader(ctx)?;
    init_on_delete_asset_loader(ctx)?;
    init_on_delete_many_assets_loader(ctx)?;
    init_on_delete_filtered_assets_loader(ctx)?;

    init_assert_upload_asset_loader(ctx)?;
    init_assert_delete_asset_loader(ctx)?;

    Ok(())
}

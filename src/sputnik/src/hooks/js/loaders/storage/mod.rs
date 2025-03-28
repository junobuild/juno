mod on_upload_asset;

use crate::hooks::js::loaders::storage::on_upload_asset::init_on_upload_asset_loader;
use rquickjs::{Ctx, Error as JsError};

pub fn init_storage_loaders(ctx: &Ctx) -> Result<(), JsError> {
    init_on_upload_asset_loader(ctx)?;

    Ok(())
}

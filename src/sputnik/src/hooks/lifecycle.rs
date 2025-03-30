use crate::hooks::js::loaders::init_loaders;
use crate::hooks::js::runtime::lifecycle::on_post_upgrade::execute_on_post_upgrade;
use crate::js::runtime::execute_sync_js;
use junobuild_macros::on_post_upgrade;

#[on_post_upgrade]
fn on_post_upgrade() -> Result<(), String> {
    execute_sync_js(|ctx| {
        init_loaders(ctx).map_err(|e| e.to_string())?;

        execute_on_post_upgrade(ctx).map_err(|e| e.to_string())?;

        Ok(())
    })
    .map_err(|e| e.to_string())
}

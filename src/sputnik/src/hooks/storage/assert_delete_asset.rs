use crate::hooks::js::runtime::storage::assert_delete_asset::AssertDeleteAsset;
use crate::hooks::js::runtime::types::AssertJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::execute_sync_js;
use crate::state::store::get_assert_delete_asset_collections;
use junobuild_satellite::AssertDeleteAssetContext;
use rquickjs::CatchResultExt;

#[no_mangle]
pub extern "Rust" fn juno_assert_delete_asset(
    context: AssertDeleteAssetContext,
) -> Result<(), String> {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        AssertDeleteAsset
            .execute(ctx, context.clone())
            .catch(ctx)
            .map_err(|e| e.to_string())?;

        Ok(())
    })
    .map_err(|e| e.to_string())
}

#[no_mangle]
pub extern "Rust" fn juno_assert_delete_asset_collections() -> Option<Vec<String>> {
    let collections = get_assert_delete_asset_collections();
    Some(collections)
}

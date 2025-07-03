use crate::hooks::js::runtime::storage::on_upload_asset::OnUploadAsset;
use crate::hooks::js::runtime::types::OnJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::{execute_async_js, RunAsyncJsFn};
use crate::state::store::get_on_upload_asset_collections;
use ic_cdk::futures::spawn_017_compat;
use ic_cdk::trap;
use junobuild_satellite::OnUploadAssetContext;
use rquickjs::{Ctx, Error as JsError};

#[no_mangle]
pub extern "Rust" fn juno_on_upload_asset(context: OnUploadAssetContext) {
    spawn_017_compat(async move {
        let execute_context = AsyncJsFnContext { context };

        if let Err(e) = execute_async_js(execute_context).await {
            trap(&e.to_string());
        }
    });
}

pub struct AsyncJsFnContext {
    pub context: OnUploadAssetContext,
}

impl RunAsyncJsFn for AsyncJsFnContext {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), JsError> {
        init_sdk(ctx)?;

        OnUploadAsset.execute(ctx, self.context.clone()).await
    }
}

#[no_mangle]
pub extern "Rust" fn juno_on_upload_asset_collections() -> Option<Vec<String>> {
    let collections = get_on_upload_asset_collections();
    Some(collections)
}

use crate::hooks::js::runtime::runner::{execute_hook, make_loader_code};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::OnSetDocContext;
use rquickjs::{Ctx, Error as JsError};

pub struct OnUploadAsset;

impl JsHook for OnUploadAsset {
    fn get_loader_code(&self) -> String {
        make_loader_code("onUploadAsset", "__juno_satellite_on_upload_asset_loader")
    }
}

impl OnJsHook<OnSetDocContext> for OnUploadAsset {
    async fn execute<'js>(&self, ctx: &Ctx<'js>, context: OnSetDocContext) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_upload_asset(context, ctx)?;
        execute_hook(ctx, js_context, "onUploadAsset").await
    }
}

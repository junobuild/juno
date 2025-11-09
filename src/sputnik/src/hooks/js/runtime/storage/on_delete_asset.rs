use crate::hooks::js::runtime::runner::{execute_hook, make_loader_code};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::OnDeleteAssetContext;
use rquickjs::{Ctx, Error as JsError};

const ON_FUNCTION: &str = "onDeleteAsset";

pub struct OnDeleteAsset;

impl JsHook for OnDeleteAsset {
    fn get_loader_code(&self) -> String {
        make_loader_code(ON_FUNCTION, "__juno_satellite_on_delete_asset_loader")
    }
}

impl OnJsHook<OnDeleteAssetContext> for OnDeleteAsset {
    async fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: OnDeleteAssetContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_delete_asset(ctx, context)?;
        execute_hook(ctx, js_context, ON_FUNCTION).await
    }
}

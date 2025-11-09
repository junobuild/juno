use crate::hooks::js::runtime::runner::{execute_hook, make_loader_code};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::OnDeleteFilteredAssetsContext;
use rquickjs::{Ctx, Error as JsError};

const ON_FUNCTION: &str = "onDeleteFilteredAssets";

pub struct OnDeleteFilteredAssets;

impl JsHook for OnDeleteFilteredAssets {
    fn get_loader_code(&self) -> String {
        make_loader_code(
            ON_FUNCTION,
            "__juno_satellite_on_delete_filtered_assets_loader",
        )
    }
}

impl OnJsHook<OnDeleteFilteredAssetsContext> for OnDeleteFilteredAssets {
    async fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: OnDeleteFilteredAssetsContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_delete_filtered_assets(ctx, context)?;
        execute_hook(ctx, js_context, ON_FUNCTION).await
    }
}

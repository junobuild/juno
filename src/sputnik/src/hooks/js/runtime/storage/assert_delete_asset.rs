use crate::hooks::js::runtime::runner::{execute_assertion, make_loader_code};
use crate::hooks::js::runtime::types::{AssertJsHook, JsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::{AssertDeleteAssetContext, AssertDeleteDocContext};
use rquickjs::{Ctx, Error as JsError};

const ASSERT_FUNCTION: &str = "assertDeleteAsset";

pub struct AssertDeleteAsset;

impl JsHook for AssertDeleteAsset {
    fn get_loader_code(&self) -> String {
        make_loader_code(
            ASSERT_FUNCTION,
            "__juno_satellite_assert_delete_asset_loader",
        )
    }
}

impl AssertJsHook<AssertDeleteAssetContext> for AssertDeleteAsset {
    fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: AssertDeleteAssetContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_assert_delete_asset(context, ctx)?;
        execute_assertion(ctx, js_context, ASSERT_FUNCTION)
    }
}

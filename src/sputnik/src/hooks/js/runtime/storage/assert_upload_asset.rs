use crate::hooks::js::runtime::runner::{execute_assertion, make_loader_code};
use crate::hooks::js::runtime::types::{AssertJsHook, JsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::AssertUploadAssetContext;
use rquickjs::{Ctx, Error as JsError};

const ASSERT_FUNCTION: &str = "assertUploadAsset";

pub struct AssertUploadAsset;

impl JsHook for AssertUploadAsset {
    fn get_loader_code(&self) -> String {
        make_loader_code(
            ASSERT_FUNCTION,
            "__juno_satellite_assert_upload_asset_loader",
        )
    }
}

impl AssertJsHook<AssertUploadAssetContext> for AssertUploadAsset {
    fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: AssertUploadAssetContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_assert_upload_asset(ctx, context)?;
        execute_assertion(ctx, js_context, ASSERT_FUNCTION)
    }
}

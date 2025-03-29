use crate::hooks::js::types::hooks::JsHookContext;
use crate::hooks::js::types::storage::JsAsset;
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::OnUploadAssetContext;
use rquickjs::{Ctx, Error as JsError};

impl<'js> JsHookContext<'js, JsAsset<'js>> {
    pub fn from_on_upload_asset(
        original: OnUploadAssetContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsAsset::from_asset(ctx, original.data)?,
        })
    }
}

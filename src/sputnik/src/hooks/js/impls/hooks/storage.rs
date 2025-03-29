use crate::hooks::js::types::hooks::JsHookContext;
use crate::hooks::js::types::storage::JsAsset;
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::{
    OnDeleteAssetContext, OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext,
    OnDeleteManyAssetsContext, OnUploadAssetContext,
};
use rquickjs::{Ctx, Error as JsError};

// TODO: invert ctx param first

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

impl<'js> JsHookContext<'js, Option<JsAsset<'js>>> {
    pub fn from_on_delete_asset(
        original: OnDeleteAssetContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let data = original
            .data
            .map(|asset| JsAsset::from_asset(ctx, asset))
            .transpose()?;

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }
}

impl<'js> JsHookContext<'js, Vec<Option<JsAsset<'js>>>> {
    pub fn from_on_delete_many_assets(
        original: OnDeleteManyAssetsContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let data: Vec<Option<JsAsset<'js>>> = original
            .data
            .into_iter()
            .map(|maybe_asset| maybe_asset.map(|a| JsAsset::from_asset(ctx, a)).transpose())
            .collect::<Result<Vec<Option<JsAsset<'js>>>, JsError>>()?;

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }

    pub fn from_on_delete_filtered_assets(
        original: OnDeleteFilteredAssetsContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        Self::from_on_delete_many_assets(original, ctx)
    }
}

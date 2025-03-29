use crate::hooks::js::impls::hooks::utils::into_optional_jsasset_js;
use crate::hooks::js::types::hooks::{JsAssetAssertUpload, JsHookContext};
use crate::hooks::js::types::interface::JsCommitBatch;
use crate::hooks::js::types::storage::{JsAsset, JsBatch};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::{
    AssertDeleteAssetContext, AssertUploadAssetContext, OnDeleteAssetContext,
    OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext, OnDeleteManyAssetsContext,
    OnUploadAssetContext,
};
use rquickjs::{Ctx, Error as JsError, IntoJs, Object, Result as JsResult, Value};

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

    pub fn from_assert_delete_asset(
        original: AssertDeleteAssetContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        Self::from_on_upload_asset(original, ctx)
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

impl<'js> JsHookContext<'js, JsAssetAssertUpload<'js>> {
    pub fn from_assert_upload_asset(
        original: AssertUploadAssetContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let data = JsAssetAssertUpload {
            current: original
                .data
                .current
                .map(|asset| JsAsset::from_asset(ctx, asset))
                .transpose()?,
            batch: JsBatch::from_batch(ctx, original.data.batch)?,
            commit_batch: JsCommitBatch::from_commit_batch(original.data.commit_batch),
        };

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsAssetAssertUpload<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        obj.set("current", into_optional_jsasset_js(ctx, self.current)?)?;
        obj.set("batch", self.batch.into_js(ctx)?)?;
        obj.set("commit_batch", self.commit_batch.into_js(ctx)?)?;

        Ok(obj.into_value())
    }
}

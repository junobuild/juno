use crate::hooks::js::types::storage::JsAssetKey;
use rquickjs::{BigInt, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value};
use junobuild_storage::types::store::AssetKey;
use crate::js::types::candid::JsRawPrincipal;

impl<'js> JsAssetKey<'js> {
    pub fn from_asset_key(ctx: &Ctx<'js>, key: AssetKey) -> JsResult<Self> {
        Ok(Self {
            name: key.name,
            full_path: key.full_path,
            token: key.token,
            collection: key.collection,
            owner: JsRawPrincipal::from_principal(ctx, &key.owner)?,
            description: key.description,
        })
    }
}
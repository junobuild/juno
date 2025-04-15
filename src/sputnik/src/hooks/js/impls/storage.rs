use crate::hooks::js::impls::utils::{into_bigint_js, into_optional_bigint_js};
use crate::hooks::js::types::interface::JsCommitBatch;
use crate::hooks::js::types::storage::{
    JsAsset, JsAssetEncoding, JsAssetEncodings, JsAssetKey, JsBatch, JsBlobOrKey, JsHash,
    JsHeaderField,
};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::types::interface::CommitBatch;
use junobuild_storage::types::store::{Asset, AssetEncoding, AssetKey, Batch};
use rquickjs::{Array, Ctx, Error as JsError, IntoJs, Object, Result as JsResult, Value};

impl<'js> JsAssetKey<'js> {
    pub fn from_asset_key(ctx: &Ctx<'js>, key: AssetKey) -> JsResult<JsAssetKey<'js>> {
        Ok(JsAssetKey {
            name: key.name,
            full_path: key.full_path,
            token: key.token,
            collection: key.collection,
            owner: JsRawPrincipal::from_principal(ctx, &key.owner)?,
            description: key.description,
        })
    }
}

impl<'js> JsAssetEncoding<'js> {
    pub fn from_encoding(
        ctx: &Ctx<'js>,
        encoding: AssetEncoding,
    ) -> JsResult<JsAssetEncoding<'js>> {
        let content_chunks: Vec<JsBlobOrKey<'js>> = encoding
            .content_chunks
            .into_iter()
            .map(|chunk| JsBlobOrKey::from_bytes(ctx, &chunk))
            .collect::<Result<Vec<JsBlobOrKey<'js>>, JsError>>()?;

        let sha256: JsHash<'js> = JsHash::from_bytes(ctx, &encoding.sha256)?;

        Ok(JsAssetEncoding {
            modified: encoding.modified,
            content_chunks,
            total_length: encoding.total_length.to_string(),
            sha256,
        })
    }
}

impl<'js> JsAsset<'js> {
    pub fn from_asset(ctx: &Ctx<'js>, asset: Asset) -> JsResult<JsAsset<'js>> {
        let key: JsAssetKey<'js> = JsAssetKey::from_asset_key(ctx, asset.key)?;

        let encodings: Vec<JsAssetEncodings<'js>> = asset
            .encodings
            .into_iter()
            .map(|(encoding_type, encoding)| {
                let js_encoding = JsAssetEncoding::from_encoding(ctx, encoding)?;
                Ok(JsAssetEncodings(encoding_type, js_encoding))
            })
            .collect::<Result<Vec<JsAssetEncodings<'js>>, JsError>>()?;

        let headers: Vec<JsHeaderField> = asset
            .headers
            .into_iter()
            .map(|HeaderField(key, value)| JsHeaderField(key, value))
            .collect();

        Ok(JsAsset {
            key,
            headers,
            encodings,
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            version: asset.version,
        })
    }
}

impl<'js> JsBatch<'js> {
    pub fn from_batch(ctx: &Ctx<'js>, batch: Batch) -> JsResult<Self> {
        Ok(JsBatch {
            key: JsAssetKey::from_asset_key(ctx, batch.key)?,
            reference_id: batch.reference_id.map(|id| id.to_string()),
            expires_at: batch.expires_at,
            encoding_type: batch.encoding_type,
        })
    }
}

impl JsCommitBatch {
    pub fn from_commit_batch(commit: CommitBatch) -> Self {
        JsCommitBatch {
            batch_id: commit.batch_id.to_string(),
            headers: commit
                .headers
                .into_iter()
                .map(|HeaderField(k, v)| JsHeaderField(k, v))
                .collect(),
            chunk_ids: commit
                .chunk_ids
                .into_iter()
                .map(|id| id.to_string())
                .collect(),
        }
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsHeaderField {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0)?;
        arr.set(1, self.1)?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAssetKey<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("name", self.name)?;
        obj.set("full_path", self.full_path)?;
        obj.set("token", self.token)?;
        obj.set("collection", self.collection)?;
        obj.set("owner", self.owner)?;
        obj.set("description", self.description)?;
        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAssetEncoding<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("created_at", into_bigint_js(ctx, self.modified))?;
        obj.set("content_chunks", self.content_chunks.into_js(ctx)?)?;
        obj.set("total_length", self.total_length.into_js(ctx)?)?;
        obj.set("sha256", self.sha256.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAssetEncodings<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0)?;
        arr.set(1, self.1.into_js(ctx)?)?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAsset<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("key", self.key.into_js(ctx)?)?;
        obj.set("headers", self.headers.into_js(ctx)?)?;
        obj.set("encodings", self.encodings.into_js(ctx)?)?;

        obj.set("created_at", into_bigint_js(ctx, self.created_at))?;
        obj.set("updated_at", into_bigint_js(ctx, self.updated_at))?;

        obj.set("version", into_optional_bigint_js(ctx, self.version)?)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsBatch<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("key", self.key.into_js(ctx)?)?;
        obj.set("reference_id", self.reference_id)?;
        obj.set("expires_at", into_bigint_js(ctx, self.expires_at))?;
        obj.set("encoding_type", self.encoding_type)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsCommitBatch {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("batch_id", self.batch_id)?;
        obj.set("headers", self.headers.into_js(ctx)?)?;
        obj.set("chunk_ids", self.chunk_ids.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

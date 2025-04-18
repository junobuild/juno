use crate::hooks::js::types::interface::{
    JsAssetEncodingNoContent, JsAssetEncodingNotContentRecord, JsAssetNoContent, JsCommitBatch,
};
use crate::hooks::js::types::storage::{
    JsAsset, JsAssetEncoding, JsAssetEncodingRecord, JsAssetKey, JsBatch, JsBlobOrKey, JsHash,
    JsHeaderFieldRecord, JsHeaderFields,
};
use crate::js::types::candid::JsRawPrincipal;
use crate::js::types::primitives::JsU128Compat;
use crate::js::utils::primitives::{from_bigint_js, into_bigint_js, into_optional_bigint_js};
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::types::interface::{AssetEncodingNoContent, AssetNoContent, CommitBatch};
use junobuild_storage::types::store::{Asset, AssetEncoding, AssetKey, Batch, BlobOrKey};
use rquickjs::{Array, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value};

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

    pub fn to_asset_key(&self) -> JsResult<AssetKey> {
        Ok(AssetKey {
            name: self.name.clone(),
            full_path: self.full_path.clone(),
            token: self.token.clone(),
            collection: self.collection.clone(),
            owner: self.owner.to_principal()?,
            description: self.description.clone(),
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
            total_length: JsU128Compat(encoding.total_length),
            sha256,
        })
    }

    pub fn to_encoding(&self) -> JsResult<AssetEncoding> {
        let content_chunks: Vec<BlobOrKey> = self
            .content_chunks
            .iter()
            .map(|chunk| chunk.to_bytes().map(|b| b.to_vec()))
            .collect::<JsResult<Vec<BlobOrKey>>>()?;

        let sha256: [u8; 32] = self
            .sha256
            .to_bytes()?
            .try_into()
            .map_err(|_| JsError::new_from_js("JsAssetEncoding", "sha256 must be 32 bytes"))?;

        let total_length = self.total_length.to_u128();

        Ok(AssetEncoding {
            modified: self.modified,
            content_chunks,
            total_length,
            sha256,
        })
    }
}

impl<'js> JsAssetEncodingNoContent<'js> {
    pub fn from_encoding_no_content(
        ctx: &Ctx<'js>,
        encoding: AssetEncodingNoContent,
    ) -> JsResult<JsAssetEncodingNoContent<'js>> {
        let sha256: JsHash<'js> = JsHash::from_bytes(ctx, &encoding.sha256)?;

        Ok(JsAssetEncodingNoContent {
            modified: encoding.modified,
            total_length: JsU128Compat(encoding.total_length),
            sha256,
        })
    }
}

impl<'js> JsAsset<'js> {
    pub fn from_asset(ctx: &Ctx<'js>, asset: Asset) -> JsResult<JsAsset<'js>> {
        let key: JsAssetKey<'js> = JsAssetKey::from_asset_key(ctx, asset.key)?;

        let encodings: Vec<JsAssetEncodingRecord<'js>> = asset
            .encodings
            .into_iter()
            .map(|(encoding_type, encoding)| {
                let js_encoding = JsAssetEncoding::from_encoding(ctx, encoding)?;
                Ok(JsAssetEncodingRecord(encoding_type, js_encoding))
            })
            .collect::<Result<Vec<JsAssetEncodingRecord<'js>>, JsError>>()?;

        let headers: JsHeaderFields = JsHeaderFields(
            asset
                .headers
                .into_iter()
                .map(|HeaderField(key, value)| JsHeaderFieldRecord(key, value))
                .collect(),
        );

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

impl<'js> JsAssetNoContent<'js> {
    pub fn from_asset_no_content(
        ctx: &Ctx<'js>,
        asset: AssetNoContent,
    ) -> JsResult<JsAssetNoContent<'js>> {
        let key: JsAssetKey<'js> = JsAssetKey::from_asset_key(ctx, asset.key)?;

        let encodings: Vec<JsAssetEncodingNotContentRecord<'js>> = asset
            .encodings
            .into_iter()
            .map(|(encoding_type, encoding)| {
                let js_encoding =
                    JsAssetEncodingNoContent::from_encoding_no_content(ctx, encoding)?;
                Ok(JsAssetEncodingNotContentRecord(encoding_type, js_encoding))
            })
            .collect::<Result<Vec<JsAssetEncodingNotContentRecord<'js>>, JsError>>()?;

        let headers: JsHeaderFields = JsHeaderFields(
            asset
                .headers
                .into_iter()
                .map(|HeaderField(key, value)| JsHeaderFieldRecord(key, value))
                .collect(),
        );

        Ok(JsAssetNoContent {
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
            headers: JsHeaderFields(
                commit
                    .headers
                    .into_iter()
                    .map(|HeaderField(k, v)| JsHeaderFieldRecord(k, v))
                    .collect(),
            ),
            chunk_ids: commit
                .chunk_ids
                .into_iter()
                .map(|id| id.to_string())
                .collect(),
        }
    }
}

impl From<JsHeaderFieldRecord> for HeaderField {
    fn from(JsHeaderFieldRecord(name, value): JsHeaderFieldRecord) -> Self {
        HeaderField(name, value)
    }
}

impl JsHeaderFields {
    pub fn to_header_fields(&self) -> Vec<HeaderField> {
        self.0
            .iter()
            .map(|JsHeaderFieldRecord(k, v)| HeaderField(k.clone(), v.clone()))
            .collect()
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsHeaderFieldRecord {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0)?;
        arr.set(1, self.1)?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsHeaderFields {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        for (i, record) in self.0.into_iter().enumerate() {
            arr.set(i, record.into_js(ctx)?)?;
        }
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
        obj.set("modified", into_bigint_js(ctx, self.modified))?;
        obj.set("content_chunks", self.content_chunks.into_js(ctx)?)?;
        obj.set("total_length", self.total_length.into_js(ctx)?)?;
        obj.set("sha256", self.sha256.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAssetEncodingNoContent<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("modified", into_bigint_js(ctx, self.modified))?;
        obj.set("total_length", self.total_length.into_js(ctx)?)?;
        obj.set("sha256", self.sha256.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAssetEncodingRecord<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0)?;
        arr.set(1, self.1.into_js(ctx)?)?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAssetEncodingNotContentRecord<'js> {
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

impl<'js> IntoJs<'js> for JsAssetNoContent<'js> {
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

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsHeaderFieldRecord {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let key = arr.get(0)?;
        let value = arr.get(1)?;

        Ok(Self(key, value))
    }
}

impl<'js> FromJs<'js> for JsHeaderFields {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let mut headers = Vec::with_capacity(arr.len());

        for i in 0..arr.len() {
            let val: Value = arr.get(i)?;
            let header = JsHeaderFieldRecord::from_js(ctx, val)?;
            headers.push(header);
        }

        Ok(Self(headers))
    }
}

impl<'js> FromJs<'js> for JsAssetKey<'js> {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        Ok(JsAssetKey {
            name: obj.get("name")?,
            full_path: obj.get("full_path")?,
            token: obj.get("token").ok(),
            collection: obj.get("collection")?,
            owner: obj.get("owner")?,
            description: obj.get("description").ok(),
        })
    }
}

impl<'js> FromJs<'js> for JsAssetEncoding<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_js(ctx, value)?;

        let modified = from_bigint_js(obj.get("modified")?)?;

        Ok(JsAssetEncoding {
            modified,
            content_chunks: obj.get("content_chunks")?,
            total_length: obj.get("total_length")?,
            sha256: obj.get("sha256")?,
        })
    }
}

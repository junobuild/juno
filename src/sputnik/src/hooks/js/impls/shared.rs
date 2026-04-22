use crate::js::types::candid::JsRawPrincipal;
use crate::js::utils::primitives::{
    from_bigint_js, from_optional_bigint_js, into_bigint_js, into_optional_bigint_js,
};
use crate::sdk::js::types::shared::{
    JsAccessKey, JsAccessKeyKind, JsAccessKeyRecord, JsAccessKeyScope, JsAccessKeys,
    JsMetadataRecord,
};
use junobuild_shared::types::state::{
    AccessKey, AccessKeyKind, AccessKeyScope, AccessKeys, Timestamp,
};
use rquickjs::{
    Array, BigInt, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value,
};

impl<'js> JsAccessKey {
    pub fn from_access_key(_ctx: &Ctx<'js>, access_key: AccessKey) -> JsResult<Self> {
        Ok(Self {
            metadata: access_key
                .metadata
                .into_iter()
                .map(|(key, value)| JsMetadataRecord(key, value))
                .collect(),
            created_at: access_key.created_at,
            updated_at: access_key.updated_at,
            expires_at: access_key.expires_at,
            scope: match access_key.scope {
                AccessKeyScope::Write => JsAccessKeyScope::Write,
                AccessKeyScope::Admin => JsAccessKeyScope::Admin,
                AccessKeyScope::Submit => JsAccessKeyScope::Submit,
            },
            kind: access_key.kind.map(|kind| match kind {
                AccessKeyKind::Automation => JsAccessKeyKind::Automation,
                AccessKeyKind::Emulator => JsAccessKeyKind::Emulator,
            }),
        })
    }

    pub fn to_access_key(&self) -> JsResult<AccessKey> {
        Ok(AccessKey {
            metadata: self
                .metadata
                .iter()
                .map(|JsMetadataRecord(key, value)| (key.clone(), value.clone()))
                .collect(),
            created_at: self.created_at,
            updated_at: self.updated_at,
            expires_at: self.expires_at,
            scope: match self.scope {
                JsAccessKeyScope::Write => AccessKeyScope::Write,
                JsAccessKeyScope::Admin => AccessKeyScope::Admin,
                JsAccessKeyScope::Submit => AccessKeyScope::Submit,
            },
            kind: self.kind.as_ref().map(|kind| match kind {
                JsAccessKeyKind::Automation => AccessKeyKind::Automation,
                JsAccessKeyKind::Emulator => AccessKeyKind::Emulator,
            }),
        })
    }
}

impl<'js> JsAccessKeys<'js> {
    pub fn from_access_keys(ctx: &Ctx<'js>, access_keys: AccessKeys) -> JsResult<Self> {
        let records = access_keys
            .into_iter()
            .map(|(id, access_key)| {
                Ok(JsAccessKeyRecord(
                    JsRawPrincipal::from_principal(ctx, &id)?,
                    JsAccessKey::from_access_key(ctx, access_key)?,
                ))
            })
            .collect::<JsResult<Vec<JsAccessKeyRecord<'js>>>>()?;

        Ok(Self(records))
    }
}

impl<'js> JsAccessKeys<'js> {
    pub fn to_access_keys(&self) -> JsResult<AccessKeys> {
        self.0
            .iter()
            .map(|JsAccessKeyRecord(id, access_key)| {
                Ok((id.to_principal()?, access_key.to_access_key()?))
            })
            .collect()
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsAccessKeyScope {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let s = match self {
            JsAccessKeyScope::Write => "write",
            JsAccessKeyScope::Admin => "admin",
            JsAccessKeyScope::Submit => "submit",
        };

        s.into_js(ctx)
    }
}

impl<'js> IntoJs<'js> for JsAccessKeyKind {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let s = match self {
            JsAccessKeyKind::Automation => "automation",
            JsAccessKeyKind::Emulator => "emulator",
        };

        s.into_js(ctx)
    }
}

impl<'js> IntoJs<'js> for JsAccessKey {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        obj.set("metadata", self.metadata.into_js(ctx))?;

        obj.set("created_at", into_bigint_js(ctx, self.created_at))?;
        obj.set("updated_at", into_bigint_js(ctx, self.updated_at))?;

        obj.set("expires_at", into_optional_bigint_js(ctx, self.expires_at)?)?;

        obj.set("scope", self.scope)?;

        obj.set("kind", self.kind)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAccessKeyRecord<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0.into_js(ctx))?;
        arr.set(1, self.1.into_js(ctx))?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsMetadataRecord {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        arr.set(0, self.0)?;
        arr.set(1, self.1)?;
        Ok(arr.into_value())
    }
}

impl<'js> IntoJs<'js> for JsAccessKeys<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let arr = Array::new(ctx.clone())?;
        for (i, record) in self.0.into_iter().enumerate() {
            arr.set(i, record.into_js(ctx)?)?;
        }
        Ok(arr.into_value())
    }
}

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsAccessKeyScope {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let s: String = String::from_js(ctx, value)?;

        match s.as_str() {
            "write" => Ok(Self::Write),
            "admin" => Ok(Self::Admin),
            _ => Err(JsError::new_from_js("JsControllerScope", "ControllerScope")),
        }
    }
}

impl<'js> FromJs<'js> for JsAccessKeyKind {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let s: String = String::from_js(ctx, value)?;

        match s.as_str() {
            "automation" => Ok(Self::Automation),
            "emulator" => Ok(Self::Emulator),
            _ => Err(JsError::new_from_js("JsControllerKind", "ControllerKind")),
        }
    }
}

impl<'js> FromJs<'js> for JsMetadataRecord {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let key = arr.get(0)?;
        let value = arr.get(1)?;

        Ok(Self(key, value))
    }
}

impl<'js> FromJs<'js> for JsAccessKey {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let raw_metadata: Vec<JsMetadataRecord> = obj.get("metadata")?;
        let metadata = raw_metadata.into_iter().collect();

        let created_at: Timestamp = from_bigint_js(obj.get("created_at")?)?;

        let updated_at: Timestamp = from_bigint_js(obj.get("updated_at")?)?;

        // TODO: replace Option<u64> with Option<Timestamp>
        let expires_at: Option<u64> =
            from_optional_bigint_js(obj.get::<_, Option<BigInt>>("expires_at")?)?;

        let scope = JsAccessKeyScope::from_js(ctx, obj.get("scope")?)?;

        let kind = obj
            .get::<_, Option<Value>>("kind")?
            .map(|value| JsAccessKeyKind::from_js(ctx, value))
            .transpose()?;

        Ok(Self {
            metadata,
            created_at,
            updated_at,
            expires_at,
            scope,
            kind,
        })
    }
}

impl<'js> FromJs<'js> for JsAccessKeyRecord<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let principal = JsRawPrincipal::from_js(ctx, arr.get(0)?)?;
        let access_key = JsAccessKey::from_js(ctx, arr.get(1)?)?;

        Ok(Self(principal, access_key))
    }
}

impl<'js> FromJs<'js> for JsAccessKeys<'js> {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let arr = Array::from_value(value)?;

        let mut records = Vec::with_capacity(arr.len());

        for i in 0..arr.len() {
            let val: Value = arr.get(i)?;
            let record = JsAccessKeyRecord::from_js(ctx, val)?;
            records.push(record);
        }

        Ok(Self(records))
    }
}

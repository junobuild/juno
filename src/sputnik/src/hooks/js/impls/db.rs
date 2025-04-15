use crate::hooks::js::impls::utils::{
    from_optional_bigint_js, into_bigint_js, into_optional_bigint_js,
};
use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::hooks::JsRawData;
use crate::hooks::js::types::interface::{JsDelDoc, JsSetDoc};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::{DelDoc, Doc, SetDoc};
use rquickjs::{BigInt, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value};

impl<'js> JsDoc<'js> {
    pub fn from_doc(ctx: &Ctx<'js>, doc: Doc) -> JsResult<Self> {
        Ok(Self {
            owner: JsRawPrincipal::from_principal(ctx, &doc.owner)?,
            data: JsRawData::from_bytes(ctx, &doc.data)?,
            description: doc.description,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
            version: doc.version,
        })
    }
}

impl<'js> JsSetDoc<'js> {
    pub fn from_set_doc(ctx: &Ctx<'js>, doc: SetDoc) -> JsResult<Self> {
        Ok(Self {
            data: JsRawData::from_bytes(ctx, &doc.data)?,
            description: doc.description,
            version: doc.version,
        })
    }
}

impl JsDelDoc {
    pub fn from_del_doc(doc: DelDoc) -> Self {
        Self {
            version: doc.version,
        }
    }
}

impl<'js> JsSetDoc<'js> {
    pub fn to_doc(&self) -> JsResult<SetDoc> {
        Ok(SetDoc {
            data: self.data.to_vec()?,
            description: self.description.clone(),
            version: self.version,
        })
    }
}

impl JsDelDoc {
    pub fn to_doc(&self) -> JsResult<DelDoc> {
        Ok(DelDoc {
            version: self.version,
        })
    }
}

impl<'js> JsRawData<'js> {
    pub fn from_text(ctx: &Ctx<'js>, text: &str) -> JsResult<Self> {
        Self::from_bytes(ctx, text.as_bytes())
    }

    pub fn to_vec(&self) -> JsResult<Vec<u8>> {
        self.0
            .as_bytes()
            .map(|bytes| bytes.to_vec())
            .ok_or_else(|| JsError::new_from_js("JsRawData", "Vec<u8>"))
    }

    pub fn to_text(&self) -> JsResult<String> {
        let bytes = self
            .0
            .as_bytes()
            .ok_or_else(|| JsError::new_from_js("JsRawData", "String"))?;
        Ok(String::from_utf8_lossy(bytes).to_string())
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

impl<'js> IntoJs<'js> for JsDoc<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("owner", self.owner)?;
        obj.set("data", self.data)?;
        obj.set("description", self.description)?;

        obj.set("created_at", into_bigint_js(ctx, self.created_at))?;
        obj.set("updated_at", into_bigint_js(ctx, self.updated_at))?;

        obj.set("version", into_optional_bigint_js(ctx, self.version)?)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsSetDoc<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("data", self.data)?;
        obj.set("description", self.description)?;

        obj.set("version", into_optional_bigint_js(ctx, self.version)?)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsDelDoc {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        obj.set("version", into_optional_bigint_js(ctx, self.version)?)?;

        Ok(obj.into_value())
    }
}

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsSetDoc<'js> {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let data: JsRawData<'js> = obj.get("data")?;

        let description: Option<String> = obj.get("description")?;

        let version: Option<u64> =
            from_optional_bigint_js(obj.get::<_, Option<BigInt>>("version")?)?;

        Ok(JsSetDoc {
            data,
            description,
            version,
        })
    }
}

impl<'js> FromJs<'js> for JsDelDoc {
    fn from_js(_ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let obj = Object::from_value(value)?;

        let version: Option<u64> =
            from_optional_bigint_js(obj.get::<_, Option<BigInt>>("version")?)?;

        Ok(JsDelDoc { version })
    }
}

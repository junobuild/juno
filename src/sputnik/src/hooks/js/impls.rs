use crate::hooks::js::types::hooks::{
    JsDoc, JsDocAssertDelete, JsDocAssertSet, JsDocContext, JsDocUpsert, JsHookContext, JsRawData,
};
use crate::hooks::js::types::interface::{JsDelDoc, JsSetDoc};
use crate::hooks::js::utils::{from_optional_bigint_js, into_optional_bigint_js};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::{
    AssertDeleteDocContext, DelDoc, Doc, DocAssertSet, DocContext, DocUpsert, HookContext, SetDoc,
};
use rquickjs::{BigInt, Ctx, Error as JsError, FromJs, IntoJs, Object, Result as JsResult, Value};

type OnSetDocContext = HookContext<DocContext<DocUpsert>>;
type AssertSetDocContext = HookContext<DocContext<DocAssertSet>>;

impl<'js> JsHookContext<'js, JsDocContext<JsDocUpsert<'js>>> {
    pub fn from_on_set_doc(original: OnSetDocContext, ctx: &Ctx<'js>) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_bytes(ctx, original.caller.as_slice())?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: JsDocUpsert {
                    before: original
                        .data
                        .data
                        .before
                        .map(|doc| convert_doc(ctx, doc))
                        .transpose()?,
                    after: convert_doc(ctx, original.data.data.after)?,
                },
            },
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, JsDocContext<JsDocAssertSet<'js>>> {
    pub fn from_assert_set_doc(
        original: AssertSetDocContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_bytes(ctx, original.caller.as_slice())?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: JsDocAssertSet {
                    current: original
                        .data
                        .data
                        .current
                        .map(|doc| convert_doc(ctx, doc))
                        .transpose()?,
                    proposed: convert_set_doc(ctx, original.data.data.proposed)?,
                },
            },
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, JsDocContext<JsDocAssertDelete<'js>>> {
    pub fn from_assert_delete_doc(
        original: AssertDeleteDocContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_bytes(ctx, original.caller.as_slice())?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: JsDocAssertDelete {
                    current: original
                        .data
                        .data
                        .current
                        .map(|doc| convert_doc(ctx, doc))
                        .transpose()?,
                    proposed: convert_del_doc(ctx, original.data.data.proposed)?,
                },
            },
        };

        Ok(js_context)
    }
}

fn convert_doc<'js>(ctx: &Ctx<'js>, doc: Doc) -> Result<JsDoc<'js>, JsError> {
    Ok(JsDoc {
        owner: JsRawPrincipal::from_bytes(ctx, doc.owner.as_slice())?,
        data: JsRawData::from_bytes(ctx, &doc.data)?,
        description: doc.description,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        version: doc.version,
    })
}

fn convert_set_doc<'js>(ctx: &Ctx<'js>, doc: SetDoc) -> Result<JsSetDoc<'js>, JsError> {
    Ok(JsSetDoc {
        data: JsRawData::from_bytes(ctx, &doc.data)?,
        description: doc.description,
        version: doc.version,
    })
}

fn convert_del_doc<'js>(_ctx: &Ctx<'js>, doc: DelDoc) -> Result<JsDelDoc, JsError> {
    Ok(JsDelDoc {
        version: doc.version,
    })
}

impl<'js> IntoJs<'js> for JsDoc<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("owner", self.owner)?;
        obj.set("data", self.data)?;
        obj.set("description", self.description)?;

        obj.set("created_at", JsBigInt(self.created_at).into_js(ctx)?)?;
        obj.set("updated_at", JsBigInt(self.updated_at).into_js(ctx)?)?;

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

impl<'js> IntoJs<'js> for JsDocUpsert<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        if let Some(before) = self.before {
            obj.set("before", before.into_js(ctx)?)?;
        } else {
            obj.set("before", Value::new_undefined(ctx.clone()))?;
        }

        obj.set("after", self.after.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsDocAssertSet<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        if let Some(current) = self.current {
            obj.set("current", current.into_js(ctx)?)?;
        } else {
            obj.set("current", Value::new_undefined(ctx.clone()))?;
        }

        obj.set("proposed", self.proposed.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsDocAssertDelete<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        // TODO: refactor duplicated code?

        if let Some(current) = self.current {
            obj.set("current", current.into_js(ctx)?)?;
        } else {
            obj.set("current", Value::new_undefined(ctx.clone()))?;
        }

        obj.set("proposed", self.proposed.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js, T> IntoJs<'js> for JsDocContext<T>
where
    T: IntoJs<'js>,
{
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("key", self.key)?;
        obj.set("collection", self.collection)?;
        obj.set("data", self.data.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

impl<'js, T> IntoJs<'js> for JsHookContext<'js, T>
where
    T: IntoJs<'js>,
{
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("caller", self.caller)?;
        obj.set("data", self.data.into_js(ctx)?)?;
        Ok(obj.into_value())
    }
}

pub struct JsBigInt(pub u64);

impl<'js> IntoJs<'js> for JsBigInt {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let bigint = BigInt::from_u64(ctx.clone(), self.0)?;
        Ok(bigint.into_value())
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

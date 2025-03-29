use crate::hooks::js::impls::hooks::utils::into_optional_jsdoc_js;
use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::hooks::{
    JsDocAssertDelete, JsDocAssertSet, JsDocContext, JsDocUpsert, JsHookContext,
};
use crate::hooks::js::types::interface::{JsDelDoc, JsSetDoc};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::{
    AssertDeleteDocContext, AssertSetDocContext, OnDeleteDocContext, OnDeleteFilteredDocsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext,
};
use rquickjs::{Ctx, Error as JsError, IntoJs, Object, Result as JsResult, Value};

impl<'js> JsHookContext<'js, JsDocContext<JsDocUpsert<'js>>> {
    pub fn from_on_set_doc(original: OnSetDocContext, ctx: &Ctx<'js>) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: JsDocUpsert {
                    before: original
                        .data
                        .data
                        .before
                        .map(|doc| JsDoc::from_doc(ctx, doc))
                        .transpose()?,
                    after: JsDoc::from_doc(ctx, original.data.data.after)?,
                },
            },
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, Vec<JsDocContext<JsDocUpsert<'js>>>> {
    pub fn from_on_set_many_docs(
        original: OnSetManyDocsContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let data: Vec<JsDocContext<JsDocUpsert<'js>>> = original
            .data
            .into_iter()
            .map(|doc_ctx| {
                Ok(JsDocContext {
                    key: doc_ctx.key,
                    collection: doc_ctx.collection,
                    data: JsDocUpsert {
                        before: doc_ctx
                            .data
                            .before
                            .map(|doc| JsDoc::from_doc(ctx, doc))
                            .transpose()?,
                        after: JsDoc::from_doc(ctx, doc_ctx.data.after)?,
                    },
                })
            })
            .collect::<Result<Vec<JsDocContext<JsDocUpsert<'js>>>, JsError>>()?;

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }
}

impl<'js> JsHookContext<'js, JsDocContext<Option<JsDoc<'js>>>> {
    pub fn from_on_delete_doc(
        original: OnDeleteDocContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: original
                    .data
                    .data
                    .map(|doc| JsDoc::from_doc(ctx, doc))
                    .transpose()?,
            },
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, Vec<JsDocContext<Option<JsDoc<'js>>>>> {
    pub fn from_on_delete_many_docs(
        original: OnDeleteManyDocsContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let data: Vec<JsDocContext<Option<JsDoc<'js>>>> = original
            .data
            .into_iter()
            .map(|doc_ctx| {
                Ok(JsDocContext {
                    key: doc_ctx.key,
                    collection: doc_ctx.collection,
                    data: doc_ctx
                        .data
                        .map(|doc| JsDoc::from_doc(ctx, doc))
                        .transpose()?,
                })
            })
            .collect::<Result<Vec<JsDocContext<Option<JsDoc<'js>>>>, JsError>>()?;

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }

    pub fn from_on_delete_filtered_docs(
        original: OnDeleteFilteredDocsContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        Self::from_on_delete_many_docs(original, ctx)
    }
}

impl<'js> JsHookContext<'js, JsDocContext<JsDocAssertSet<'js>>> {
    pub fn from_assert_set_doc(
        original: AssertSetDocContext,
        ctx: &Ctx<'js>,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: JsDocAssertSet {
                    current: original
                        .data
                        .data
                        .current
                        .map(|doc| JsDoc::from_doc(ctx, doc))
                        .transpose()?,
                    proposed: JsSetDoc::from_set_doc(ctx, original.data.data.proposed)?,
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
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext {
                key: original.data.key,
                collection: original.data.collection,
                data: JsDocAssertDelete {
                    current: original
                        .data
                        .data
                        .current
                        .map(|doc| JsDoc::from_doc(ctx, doc))
                        .transpose()?,
                    proposed: JsDelDoc::from_del_doc(original.data.data.proposed),
                },
            },
        };

        Ok(js_context)
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

        obj.set("current", into_optional_jsdoc_js(ctx, self.current)?)?;
        obj.set("proposed", self.proposed.into_js(ctx)?)?;

        Ok(obj.into_value())
    }
}

impl<'js> IntoJs<'js> for JsDocAssertDelete<'js> {
    fn into_js(self, ctx: &Ctx<'js>) -> JsResult<Value<'js>> {
        let obj = Object::new(ctx.clone())?;

        obj.set("current", into_optional_jsdoc_js(ctx, self.current)?)?;
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

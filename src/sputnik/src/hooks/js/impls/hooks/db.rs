use crate::hooks::js::impls::hooks::utils::into_optional_jsdoc_js;
use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::hooks::{
    JsDocAssertDelete, JsDocAssertSet, JsDocContext, JsDocUpsert, JsHookContext,
};
use crate::hooks::js::types::interface::{JsDelDoc, JsSetDoc};
use crate::js::types::candid::JsRawPrincipal;
use junobuild_satellite::{
    AssertDeleteDocContext, AssertSetDocContext, Doc, DocAssertDelete, DocAssertSet, DocContext,
    DocUpsert, OnDeleteDocContext, OnDeleteFilteredDocsContext, OnDeleteManyDocsContext,
    OnSetDocContext, OnSetManyDocsContext,
};
use rquickjs::{Ctx, Error as JsError, IntoJs, Object, Result as JsResult, Value};

impl<'js> JsHookContext<'js, JsDocContext<JsDocUpsert<'js>>> {
    pub fn from_on_set_doc(ctx: &Ctx<'js>, original: OnSetDocContext) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext::from_context_doc_upsert(ctx, original.data)?,
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, Vec<JsDocContext<JsDocUpsert<'js>>>> {
    pub fn from_on_set_many_docs(
        ctx: &Ctx<'js>,
        original: OnSetManyDocsContext,
    ) -> Result<Self, JsError> {
        let data: Vec<JsDocContext<JsDocUpsert<'js>>> = original
            .data
            .into_iter()
            .map(|doc_ctx| JsDocContext::from_context_doc_upsert(ctx, doc_ctx))
            .collect::<Result<Vec<JsDocContext<JsDocUpsert<'js>>>, JsError>>()?;

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }
}

impl<'js> JsHookContext<'js, JsDocContext<Option<JsDoc<'js>>>> {
    pub fn from_on_delete_doc(
        ctx: &Ctx<'js>,
        original: OnDeleteDocContext,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext::from_context_option_doc(ctx, original.data)?,
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, Vec<JsDocContext<Option<JsDoc<'js>>>>> {
    pub fn from_on_delete_many_docs(
        ctx: &Ctx<'js>,
        original: OnDeleteManyDocsContext,
    ) -> Result<Self, JsError> {
        let data: Vec<JsDocContext<Option<JsDoc<'js>>>> = original
            .data
            .into_iter()
            .map(|doc_ctx| JsDocContext::from_context_option_doc(ctx, doc_ctx))
            .collect::<Result<Vec<JsDocContext<Option<JsDoc<'js>>>>, JsError>>()?;

        Ok(JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data,
        })
    }

    pub fn from_on_delete_filtered_docs(
        ctx: &Ctx<'js>,
        original: OnDeleteFilteredDocsContext,
    ) -> Result<Self, JsError> {
        Self::from_on_delete_many_docs(ctx, original)
    }
}

impl<'js> JsHookContext<'js, JsDocContext<JsDocAssertSet<'js>>> {
    pub fn from_assert_set_doc(
        ctx: &Ctx<'js>,
        original: AssertSetDocContext,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext::from_context_assert_set(ctx, original.data)?,
        };

        Ok(js_context)
    }
}

impl<'js> JsHookContext<'js, JsDocContext<JsDocAssertDelete<'js>>> {
    pub fn from_assert_delete_doc(
        ctx: &Ctx<'js>,
        original: AssertDeleteDocContext,
    ) -> Result<Self, JsError> {
        let js_context = JsHookContext {
            caller: JsRawPrincipal::from_principal(ctx, &original.caller)?,
            data: JsDocContext::from_context_assert_delete(ctx, original.data)?,
        };

        Ok(js_context)
    }
}

impl<'js> JsDocContext<JsDocUpsert<'js>> {
    pub fn from_context_doc_upsert(
        ctx: &Ctx<'js>,
        doc_ctx: DocContext<DocUpsert>,
    ) -> Result<Self, JsError> {
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
    }
}

impl<'js> JsDocContext<Option<JsDoc<'js>>> {
    pub fn from_context_option_doc(
        ctx: &Ctx<'js>,
        doc_ctx: DocContext<Option<Doc>>,
    ) -> Result<Self, JsError> {
        Ok(JsDocContext {
            key: doc_ctx.key,
            collection: doc_ctx.collection,
            data: doc_ctx
                .data
                .map(|doc| JsDoc::from_doc(ctx, doc))
                .transpose()?,
        })
    }
}

impl<'js> JsDocContext<JsDocAssertSet<'js>> {
    pub fn from_context_assert_set(
        ctx: &Ctx<'js>,
        doc_ctx: DocContext<DocAssertSet>,
    ) -> Result<Self, JsError> {
        Ok(JsDocContext {
            key: doc_ctx.key,
            collection: doc_ctx.collection,
            data: JsDocAssertSet {
                current: doc_ctx
                    .data
                    .current
                    .map(|doc| JsDoc::from_doc(ctx, doc))
                    .transpose()?,
                proposed: JsSetDoc::from_set_doc(ctx, doc_ctx.data.proposed)?,
            },
        })
    }
}

impl<'js> JsDocContext<JsDocAssertDelete<'js>> {
    pub fn from_context_assert_delete(
        ctx: &Ctx<'js>,
        doc_ctx: DocContext<DocAssertDelete>,
    ) -> Result<Self, JsError> {
        Ok(JsDocContext {
            key: doc_ctx.key,
            collection: doc_ctx.collection,
            data: JsDocAssertDelete {
                current: doc_ctx
                    .data
                    .current
                    .map(|doc| JsDoc::from_doc(ctx, doc))
                    .transpose()?,
                proposed: JsDelDoc::from_del_doc(doc_ctx.data.proposed),
            },
        })
    }
}

// ---------------------------------------------------------
// IntoJs
// ---------------------------------------------------------

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

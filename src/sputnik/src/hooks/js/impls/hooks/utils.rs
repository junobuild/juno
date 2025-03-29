use crate::hooks::js::types::db::JsDoc;
use crate::hooks::js::types::storage::JsAsset;
use rquickjs::{Ctx, IntoJs, Result as JsResult, Value};

pub fn into_optional_jsdoc_js<'js>(
    ctx: &Ctx<'js>,
    value: Option<JsDoc<'js>>,
) -> JsResult<Value<'js>> {
    match value {
        Some(value) => value.into_js(ctx),
        None => Ok(Value::new_undefined(ctx.clone())),
    }
}

pub fn into_optional_jsasset_js<'js>(
    ctx: &Ctx<'js>,
    value: Option<JsAsset<'js>>,
) -> JsResult<Value<'js>> {
    match value {
        Some(value) => value.into_js(ctx),
        None => Ok(Value::new_undefined(ctx.clone())),
    }
}

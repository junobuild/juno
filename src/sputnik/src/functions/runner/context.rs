use crate::js::types::candid::JsUint8Array;
use junobuild_utils::{FromJsonData, IntoJsonData};
use rquickjs::{Ctx, Error as JsError};

pub fn set_args<'js, A: IntoJsonData>(ctx: &Ctx<'js>, args: Option<A>) -> Result<(), JsError> {
    if let Some(args) = args {
        let bytes = args
            .into_json_data()
            .map_err(|e| JsError::new_from_js_message("Candid", "JsonData", e.to_string()))?;
        let raw = JsUint8Array::from_bytes(ctx, &bytes)?;
        ctx.globals().set("jsContext", raw)?;

        return Ok(());
    }

    // If there is no arguments to use we still define a value this way the code that is defined in get_code
    // does not fail when accessing the global value.
    ctx.globals().set("jsContext", rquickjs::Undefined)?;

    Ok(())
}

pub fn get_result<'js, R: FromJsonData>(ctx: &Ctx<'js>) -> Result<Option<R>, JsError> {
    let result: Option<JsUint8Array> = ctx.globals().get("jsResult")?;

    result
        .map(|raw| {
            raw.to_bytes().and_then(|bytes| {
                R::from_json_data(bytes)
                    .map_err(|e| JsError::new_from_js_message("JsonData", "Candid", e.to_string()))
            })
        })
        .transpose()
}

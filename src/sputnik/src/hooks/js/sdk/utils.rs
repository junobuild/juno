use crate::hooks::js::types::hooks::JsRawData;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_utils_sdk(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_satellite_datastore_raw_data_to_text", js_raw_data_to_text)?;
    global.set("__juno_satellite_datastore_raw_data_from_text", js_raw_data_from_text)?;

    Ok(())
}

#[rquickjs::function]
fn raw_data_to_text<'js>(_ctx: Ctx<'js>, data: JsRawData<'js>) -> JsResult<String> {
    let text = data.to_text()?;
    Ok(text)
}

#[rquickjs::function]
fn raw_data_from_text<'js>(ctx: Ctx<'js>, text: String) -> JsResult<JsRawData<'js>> {
    let data = JsRawData::from_text(&ctx, &text)?;
    Ok(data)
}

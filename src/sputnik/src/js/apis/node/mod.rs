mod console;
mod text_encoding;

use crate::errors::js::JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING;
use crate::js::apis::node::console::init_console_log;
use crate::js::apis::node::text_encoding::init_text_encoding;
use rquickjs::{Ctx, Error as JsError, Exception};

pub fn init_node_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_console_log(ctx)?;
    init_text_encoding(ctx).map_err(|e| {
        Exception::throw_message(
            ctx,
            &format!("{} ({})", JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING, e),
        )
    })?;

    Ok(())
}

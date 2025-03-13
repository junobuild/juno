mod javy;

use crate::errors::js::JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING;
use crate::js::apis::node::text_encoding::javy::register;
use rquickjs::{Ctx, Error as JsError, Exception};

pub fn init_text_encoding(ctx: &Ctx) -> Result<(), JsError> {
    register(ctx).map_err(|e| {
        Exception::throw_message(
            ctx,
            &format!("{} ({})", JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING, e),
        )
    })
}

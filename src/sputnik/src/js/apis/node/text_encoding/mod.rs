mod javy;

use crate::errors::js::JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING;
use crate::js::apis::node::text_encoding::javy::polyfill::register;
use rquickjs::{Ctx, Error as JsError, Exception};

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the Javy project:
// https://github.com/bytecodealliance/javy/tree/main/crates/javy/src/apis/text_encoding
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_text_encoding(ctx: &Ctx) -> Result<(), JsError> {
    register(ctx.clone()).map_err(|e| {
        Exception::throw_message(
            ctx,
            &format!("{} ({})", JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING, e),
        )
    })
}

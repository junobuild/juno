mod javy;

use crate::errors::js::JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING;
use crate::js::apis::node::text_encoding::javy::polyfill::register;
use crate::js::js_utils::throw_js_exception;
use rquickjs::{Ctx, Error as JsError};

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the Javy project:
// https://github.com/bytecodealliance/javy/tree/main/crates/javy/src/apis/text_encoding
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_text_encoding(ctx: &Ctx) -> Result<(), JsError> {
    register(ctx.clone())
        .map_err(|e| throw_js_exception(ctx, JUNO_SPUTNIK_ERROR_JS_API_TEXT_ENCODING, &e))
}

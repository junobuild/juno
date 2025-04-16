mod llrt;

use crate::js::apis::node::blob::llrt::blob::init;
use rquickjs::{Ctx, Error as JsError};

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the Javy project:
// https://github.com/bytecodealliance/javy/tree/main/crates/javy/src/apis/text_encoding
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_blob(ctx: &Ctx) -> Result<(), JsError> {
    let globals = ctx.globals();

    init(ctx, &globals)?;

    Ok(())
}

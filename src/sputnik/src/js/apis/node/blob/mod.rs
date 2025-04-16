mod llrt;

use crate::js::apis::node::blob::llrt::blob::init;
use rquickjs::{Ctx, Error as JsError};

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the LLRT project:
// https://github.com/awslabs/llrt/blob/main/modules/llrt_http/src/blob.rs
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_blob(ctx: &Ctx) -> Result<(), JsError> {
    let globals = ctx.globals();

    init(ctx, &globals)?;

    Ok(())
}

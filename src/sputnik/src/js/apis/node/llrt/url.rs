use crate::js::apis::node::llrt::llrt_url::url_class::URL;
use crate::js::apis::node::llrt::llrt_url::url_search_params::URLSearchParams;
use rquickjs::{Class, Ctx, Error as JsError};

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the LLRT project:
// https://github.com/awslabs/llrt/blob/main/modules/llrt_url/src/lib.rs
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_url(ctx: &Ctx) -> Result<(), JsError> {
    let globals = ctx.globals();

    Class::<URLSearchParams>::define(&globals)?;
    Class::<URL>::define(&globals)?;

    Ok(())
}

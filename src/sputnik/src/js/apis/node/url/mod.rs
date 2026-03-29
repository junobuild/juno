mod llrt;

use rquickjs::{atom::PredefinedAtom, prelude::Func, Class, Ctx, Error as JsError};

use crate::js::apis::node::url::llrt::url_class::URL;

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the LLRT project:
// https://github.com/awslabs/llrt/blob/main/modules/llrt_url/src/url_class.rs
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_url(ctx: &Ctx) -> Result<(), JsError> {
    let globals = ctx.globals();

    let globals = ctx.globals();

    Class::<URLSearchParams>::define(&globals)?;
    Class::<URL>::define(&globals)?;

    Ok(())
}
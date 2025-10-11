mod llrt;

use crate::js::apis::node::blob::llrt::polyfill::Blob;
use crate::js::apis::node::blob::llrt::{BasePrimordials, Primordial};
use rquickjs::{atom::PredefinedAtom, prelude::Func, Class, Ctx, Error as JsError};

// ===========================================================================================
// ⚠️ SOURCE NOTICE ⚠️
// This module is copied from the LLRT project:
// https://github.com/awslabs/llrt/blob/main/modules/llrt_buffer/src/blob.rs
//
// If you modify this file, ensure compatibility with upstream changes where applicable.
// ===========================================================================================

pub fn init_blob(ctx: &Ctx) -> Result<(), JsError> {
    let globals = ctx.globals();

    BasePrimordials::init(ctx)?;

    if let Some(constructor) = Class::<Blob>::create_constructor(ctx)? {
        constructor.prop(
            PredefinedAtom::SymbolHasInstance,
            Func::from(Blob::has_instance),
        )?;
        globals.set(stringify!(Blob), constructor)?;
    }

    Ok(())
}

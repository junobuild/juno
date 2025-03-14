mod assert_set_doc;

use crate::hooks::js::loaders::assert_set_doc::init_assert_set_doc_loader;
use rquickjs::{Ctx, Error as JsError};

pub fn init_loaders(ctx: &Ctx) -> Result<(), JsError> {
    init_assert_set_doc_loader(&ctx)?;

    Ok(())
}

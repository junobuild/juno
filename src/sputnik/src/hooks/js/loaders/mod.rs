mod assert_set_doc;
mod on_set_doc;

use crate::hooks::js::loaders::assert_set_doc::init_assert_set_doc_loader;
use crate::hooks::js::loaders::on_set_doc::init_on_set_doc_loader;
use rquickjs::{Ctx, Error as JsError};

pub fn init_loaders(ctx: &Ctx) -> Result<(), JsError> {
    init_assert_set_doc_loader(ctx)?;
    init_on_set_doc_loader(ctx)?;

    Ok(())
}

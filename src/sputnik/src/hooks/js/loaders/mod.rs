mod db;

use db::assert_delete_doc::init_assert_delete_doc_loader;
use db::assert_set_doc::init_assert_set_doc_loader;
use db::on_delete_doc::init_on_delete_doc_loader;
use db::on_delete_filtered_docs::init_on_delete_filtered_docs_loader;
use db::on_delete_many_docs::init_on_delete_many_docs_loader;
use db::on_set_doc::init_on_set_doc_loader;
use db::on_set_many_docs::init_on_set_many_docs_loader;
use rquickjs::{Ctx, Error as JsError};

pub fn init_loaders(ctx: &Ctx) -> Result<(), JsError> {
    init_assert_set_doc_loader(ctx)?;
    init_assert_delete_doc_loader(ctx)?;

    init_on_set_doc_loader(ctx)?;
    init_on_set_many_docs_loader(ctx)?;
    init_on_delete_doc_loader(ctx)?;
    init_on_delete_many_docs_loader(ctx)?;
    init_on_delete_filtered_docs_loader(ctx)?;

    Ok(())
}

mod count_collection_docs_store;
mod count_docs_store;
mod delete_doc_store;
mod get_doc_store;
mod list_docs_store;
mod set_doc_store;

use crate::hooks::js::sdk::db::count_collection_docs_store::init_count_collection_docs_store;
use crate::hooks::js::sdk::db::count_docs_store::init_count_docs_store;
use crate::hooks::js::sdk::db::delete_doc_store::init_delete_doc_store;
use crate::hooks::js::sdk::db::get_doc_store::init_get_doc_store;
use crate::hooks::js::sdk::db::list_docs_store::init_list_docs_store;
use crate::hooks::js::sdk::db::set_doc_store::init_set_doc_store;
use rquickjs::{Ctx, Error as JsError};

pub fn init_db_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_set_doc_store(ctx)?;
    init_delete_doc_store(ctx)?;
    init_get_doc_store(ctx)?;
    init_list_docs_store(ctx)?;
    init_count_collection_docs_store(ctx)?;
    init_count_docs_store(ctx)?;

    Ok(())
}

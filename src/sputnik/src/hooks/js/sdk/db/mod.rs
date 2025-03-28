mod delete_doc_store;
mod set_doc_store;

use crate::hooks::js::sdk::db::delete_doc_store::init_delete_doc_store;
use crate::hooks::js::sdk::db::set_doc_store::init_set_doc_store;
use rquickjs::{Ctx, Error as JsError};

pub fn init_db_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_set_doc_store(ctx)?;
    init_delete_doc_store(ctx)?;

    Ok(())
}

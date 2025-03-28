use crate::hooks::js::sdk::db::set_doc_store::init_set_doc_store;
use rquickjs::{Ctx, Error as JsError};

mod set_doc_store;

pub fn init_db_sdk(ctx: &Ctx) -> Result<(), JsError> {
    init_set_doc_store(ctx)?;

    Ok(())
}

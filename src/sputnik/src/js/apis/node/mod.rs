mod javy;
mod llrt;

use crate::js::apis::node::javy::init_text_encoding;
use crate::js::apis::node::llrt::init_blob;
use rquickjs::{Ctx, Error as JsError};

pub fn init_node_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_text_encoding(ctx)?;
    init_blob(ctx)?;

    Ok(())
}

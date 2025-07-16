mod blob;
mod text_encoding;

use crate::js::apis::node::blob::init_blob;
use crate::js::apis::node::text_encoding::init_text_encoding;
use rquickjs::{Ctx, Error as JsError};

pub fn init_node_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_text_encoding(ctx)?;
    init_blob(ctx)?;

    Ok(())
}

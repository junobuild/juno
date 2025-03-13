mod console;
mod text_encoding;

use crate::js::apis::node::console::init_console_log;
use crate::js::apis::node::text_encoding::init_text_encoding;
use rquickjs::{Ctx, Error as JsError};

pub fn init_node_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_console_log(ctx)?;
    init_text_encoding(ctx)?;

    Ok(())
}

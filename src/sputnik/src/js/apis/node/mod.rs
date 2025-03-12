mod console;

use crate::js::apis::node::console::init_console_log;
use rquickjs::{Ctx, Error as JsError};

pub fn init_node_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_console_log(ctx)?;

    Ok(())
}

mod node;

use crate::js::apis::node::init_node_apis;
use rquickjs::{Ctx, Error as JsError};

pub fn init_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_node_apis(ctx)?;

    Ok(())
}

mod ic_cdk;
mod node;

use crate::js::apis::ic_cdk::init_ic_cdk_apis;
use crate::js::apis::node::init_node_apis;
use rquickjs::{Ctx, Error as JsError};

pub use ic_cdk::types;

pub fn init_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_ic_cdk_apis(ctx)?;
    init_node_apis(ctx)?;

    Ok(())
}

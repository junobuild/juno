mod print;
mod id;

use crate::js::apis::ic_cdk::print::init_ic_cdk_print;
use rquickjs::{Ctx, Error as JsError};
use crate::js::apis::ic_cdk::id::init_ic_cdk_id;

pub fn init_ic_cdk_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_ic_cdk_id(ctx)?;
    init_ic_cdk_print(ctx)?;

    Ok(())
}

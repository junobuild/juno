mod call;
mod id;
mod impls;
mod print;
pub mod types;

use crate::js::apis::ic_cdk::call::init_ic_cdk_call_raw;
use crate::js::apis::ic_cdk::id::init_ic_cdk_id;
use crate::js::apis::ic_cdk::print::init_ic_cdk_print;
use rquickjs::{Ctx, Error as JsError};

pub fn init_ic_cdk_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_ic_cdk_id(ctx)?;
    init_ic_cdk_print(ctx)?;
    init_ic_cdk_call_raw(ctx)?;

    Ok(())
}

mod impls;
mod print;
pub mod types;

use crate::js::apis::ic_cdk::print::init_ic_cdk_print;
use rquickjs::{Ctx, Error as JsError};

pub fn init_ic_cdk_apis(ctx: &Ctx) -> Result<(), JsError> {
    init_ic_cdk_print(ctx)?;

    Ok(())
}

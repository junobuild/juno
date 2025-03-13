use crate::js::constants::{DEV_MODULE_NAME, DEV_SCRIPT};
use crate::js::module::engine::declare_module;
use rquickjs::{Ctx, Error as JsError, Module};

pub fn declare_dev_script<'js>(ctx: &Ctx<'js>) -> Result<Module<'js>, JsError> {
    declare_module(ctx, DEV_MODULE_NAME, DEV_SCRIPT)
}

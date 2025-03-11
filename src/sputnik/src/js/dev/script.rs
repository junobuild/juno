use crate::js::constants::{DEV_MODULE_NAME, DEV_SCRIPT};
use crate::js::module::engine::declare_module;
use rquickjs::{Ctx, Module};

pub fn declare_dev_script<'js>(ctx: &Ctx<'js>) -> Result<Module<'js>, String> {
    declare_module(ctx, DEV_MODULE_NAME, DEV_SCRIPT)
}

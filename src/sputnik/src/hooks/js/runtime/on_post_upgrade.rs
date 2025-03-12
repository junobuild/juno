use crate::hooks::js::runtime::assert_set_doc::AssertSetDoc;
use crate::hooks::js::runtime::types::JsHook;
use crate::js::constants::HOOKS_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use rquickjs::{Ctx, Error as JsError};

pub fn execute_on_post_upgrade<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    evaluate_loaders(ctx)
}

fn evaluate_loaders<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    let loaders_code = format!("{}", AssertSetDoc.get_loader_code());

    evaluate_module(ctx, HOOKS_MODULE_NAME, &loaders_code)
}
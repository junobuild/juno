use crate::hooks::js::runtime::assert_set_doc::AssertSetDoc;
use crate::hooks::js::runtime::on_set_doc::OnSetDoc;
use crate::hooks::js::runtime::types::JsHook;
use crate::js::constants::HOOKS_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use rquickjs::{Ctx, Error as JsError};

pub fn execute_on_post_upgrade<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    evaluate_loaders(ctx)
}

fn evaluate_loaders<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    let loaders = [AssertSetDoc.get_loader_code(), OnSetDoc.get_loader_code()];

    let loaders_code = loaders.join("\n");

    evaluate_module(ctx, HOOKS_MODULE_NAME, &loaders_code)
}

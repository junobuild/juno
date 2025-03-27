use crate::hooks::js::runtime::assert_delete_doc::AssertDeleteDoc;
use crate::hooks::js::runtime::assert_set_doc::AssertSetDoc;
use crate::hooks::js::runtime::on_set_doc::OnSetDoc;
use crate::hooks::js::runtime::on_set_many_docs::OnSetManyDocs;
use crate::hooks::js::runtime::types::JsHook;
use crate::js::constants::HOOKS_MODULE_NAME;
use crate::js::module::engine::evaluate_module;
use rquickjs::{Ctx, Error as JsError};

pub fn execute_on_post_upgrade<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    evaluate_loaders(ctx)
}

fn evaluate_loaders<'js>(ctx: &Ctx<'js>) -> Result<(), JsError> {
    let loaders = [
        OnSetDoc.get_loader_code(),
        OnSetManyDocs.get_loader_code(),
        AssertSetDoc.get_loader_code(),
        AssertDeleteDoc.get_loader_code(),
    ];

    let loaders_code = loaders.join("\n");

    evaluate_module(ctx, HOOKS_MODULE_NAME, &loaders_code)
}

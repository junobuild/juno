use crate::hooks::js::runtime::runner::assert::{execute_assertion, make_loader_code};
use crate::hooks::js::runtime::types::{AssertJsHook, JsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::AssertSetDocContext;
use rquickjs::{Ctx, Error as JsError};

pub struct AssertSetDoc;

impl JsHook for AssertSetDoc {
    fn get_loader_code(&self) -> String {
        make_loader_code("assertSetDoc", "__juno_satellite_assert_set_doc_loader")
    }
}

impl AssertJsHook<AssertSetDocContext> for AssertSetDoc {
    fn execute<'js>(&self, ctx: &Ctx<'js>, context: AssertSetDocContext) -> Result<(), JsError> {
        let js_context = JsHookContext::from_assert_set_doc(context, ctx)?;
        execute_assertion(ctx, js_context, "assertSetDoc")
    }
}

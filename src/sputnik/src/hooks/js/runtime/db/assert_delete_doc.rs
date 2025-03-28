use crate::hooks::js::runtime::runner::{execute_assertion, make_loader_code};
use crate::hooks::js::runtime::types::{AssertJsHook, JsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::AssertDeleteDocContext;
use rquickjs::{Ctx, Error as JsError};

const ASSERT_FUNCTION: &str = "assertDeleteDoc";

pub struct AssertDeleteDoc;

impl JsHook for AssertDeleteDoc {
    fn get_loader_code(&self) -> String {
        make_loader_code(ASSERT_FUNCTION, "__juno_satellite_assert_delete_doc_loader")
    }
}

impl AssertJsHook<AssertDeleteDocContext> for AssertDeleteDoc {
    fn execute<'js>(&self, ctx: &Ctx<'js>, context: AssertDeleteDocContext) -> Result<(), JsError> {
        let js_context = JsHookContext::from_assert_delete_doc(context, ctx)?;
        execute_assertion(ctx, js_context, ASSERT_FUNCTION)
    }
}

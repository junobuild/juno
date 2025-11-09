use crate::hooks::js::runtime::runner::{execute_hook, make_loader_code};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::OnSetManyDocsContext;
use rquickjs::{Ctx, Error as JsError};

const ON_FUNCTION: &str = "onSetManyDocs";

pub struct OnSetManyDocs;

impl JsHook for OnSetManyDocs {
    fn get_loader_code(&self) -> String {
        make_loader_code(ON_FUNCTION, "__juno_satellite_on_set_many_docs_loader")
    }
}

impl OnJsHook<OnSetManyDocsContext> for OnSetManyDocs {
    async fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: OnSetManyDocsContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_set_many_docs(ctx, context)?;
        execute_hook(ctx, js_context, ON_FUNCTION).await
    }
}

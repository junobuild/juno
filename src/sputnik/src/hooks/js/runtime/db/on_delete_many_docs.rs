use crate::hooks::js::runtime::runner::{execute_hook, make_loader_code};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::OnDeleteManyDocsContext;
use rquickjs::{Ctx, Error as JsError};

const ON_FUNCTION: &str = "onDeleteManyDocs";

pub struct OnDeleteManyDocs;

impl JsHook for OnDeleteManyDocs {
    fn get_loader_code(&self) -> String {
        make_loader_code(ON_FUNCTION, "__juno_satellite_on_delete_many_docs_loader")
    }
}

impl OnJsHook<OnDeleteManyDocsContext> for OnDeleteManyDocs {
    async fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: OnDeleteManyDocsContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_delete_many_docs(context, ctx)?;
        execute_hook(ctx, js_context, ON_FUNCTION).await
    }
}

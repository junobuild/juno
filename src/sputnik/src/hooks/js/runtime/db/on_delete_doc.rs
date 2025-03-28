use crate::hooks::js::runtime::runner::{execute_hook, make_loader_code};
use crate::hooks::js::runtime::types::{JsHook, OnJsHook};
use crate::hooks::js::types::hooks::JsHookContext;
use junobuild_satellite::OnDeleteDocContext;
use rquickjs::{Ctx, Error as JsError};

const ON_FUNCTION: &str = "onDeleteDoc";

pub struct OnDeleteDoc;

impl JsHook for OnDeleteDoc {
    fn get_loader_code(&self) -> String {
        make_loader_code(ON_FUNCTION, "__juno_satellite_on_delete_doc_loader")
    }
}

impl OnJsHook<OnDeleteDocContext> for OnDeleteDoc {
    async fn execute<'js>(
        &self,
        ctx: &Ctx<'js>,
        context: OnDeleteDocContext,
    ) -> Result<(), JsError> {
        let js_context = JsHookContext::from_on_delete_doc(context, ctx)?;
        execute_hook(ctx, js_context, ON_FUNCTION).await
    }
}

use crate::hooks::js::runtime::db::on_delete_many_docs::OnDeleteManyDocs;
use crate::hooks::js::runtime::types::OnJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::{execute_async_js, RunAsyncJsFn};
use crate::state::store::get_on_delete_many_docs_collections;
use ic_cdk::{spawn, trap};
use junobuild_satellite::OnDeleteManyDocsContext;
use rquickjs::{Ctx, Error as JsError};

#[no_mangle]
pub extern "Rust" fn juno_on_delete_many_docs(context: OnDeleteManyDocsContext) {
    spawn(async move {
        let execute_context = AsyncJsFnContext { context };

        if let Err(e) = execute_async_js(execute_context).await {
            trap(&e.to_string());
        }
    });
}

pub struct AsyncJsFnContext {
    pub context: OnDeleteManyDocsContext,
}

impl RunAsyncJsFn for AsyncJsFnContext {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), JsError> {
        init_sdk(ctx)?;

        OnDeleteManyDocs.execute(ctx, self.context.clone()).await
    }
}

#[no_mangle]
pub extern "Rust" fn juno_on_delete_many_docs_collections() -> Option<Vec<String>> {
    let collections = get_on_delete_many_docs_collections();
    Some(collections)
}

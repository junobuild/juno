use crate::hooks::js::runtime::db::on_delete_filtered_docs::OnDeleteFilteredDocs;
use crate::hooks::js::runtime::types::OnJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::{execute_async_js, RunAsyncJsFn};
use crate::state::store::get_on_delete_filtered_docs_collections;
use ic_cdk::{spawn, trap};
use junobuild_satellite::OnDeleteFilteredDocsContext;
use rquickjs::{Ctx, Error as JsError};

#[no_mangle]
pub extern "Rust" fn juno_on_delete_filtered_docs(context: OnDeleteFilteredDocsContext) {
    spawn(async move {
        let execute_context = AsyncJsFnContext { context };

        if let Err(e) = execute_async_js(execute_context).await {
            trap(&e.to_string());
        }
    });
}

pub struct AsyncJsFnContext {
    pub context: OnDeleteFilteredDocsContext,
}

impl RunAsyncJsFn for AsyncJsFnContext {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), JsError> {
        init_sdk(ctx)?;

        OnDeleteFilteredDocs
            .execute(ctx, self.context.clone())
            .await
    }
}

#[no_mangle]
pub extern "Rust" fn juno_on_delete_filtered_docs_collections() -> Option<Vec<String>> {
    let collections = get_on_delete_filtered_docs_collections();
    Some(collections)
}

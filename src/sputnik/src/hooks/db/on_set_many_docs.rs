use crate::hooks::js::runtime::db::on_set_many_docs::OnSetManyDocs;
use crate::hooks::js::runtime::types::OnJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::{execute_async_js, RunAsyncJsFn};
use crate::state::store::get_on_set_many_docs_collections;
use ic_cdk::futures::spawn_017_compat;
use ic_cdk::trap;
use junobuild_satellite::OnSetManyDocsContext;
use rquickjs::{Ctx, Error as JsError};

#[no_mangle]
pub extern "Rust" fn juno_on_set_many_docs(context: OnSetManyDocsContext) {
    spawn_017_compat(async move {
        let execute_context = AsyncJsFnContext { context };

        if let Err(e) = execute_async_js(execute_context).await {
            trap(&e.to_string());
        }
    });
}

pub struct AsyncJsFnContext {
    pub context: OnSetManyDocsContext,
}

impl RunAsyncJsFn for AsyncJsFnContext {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), JsError> {
        init_sdk(ctx)?;

        OnSetManyDocs.execute(ctx, self.context.clone()).await
    }
}

#[no_mangle]
pub extern "Rust" fn juno_on_set_many_docs_collections() -> Option<Vec<String>> {
    let collections = get_on_set_many_docs_collections();
    Some(collections)
}

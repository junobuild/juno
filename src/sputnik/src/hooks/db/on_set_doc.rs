use crate::hooks::js::runtime::db::on_set_doc::OnSetDoc;
use crate::hooks::js::runtime::types::OnJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::{execute_async_js, RunAsyncJsFn};
use crate::state::store::get_on_set_doc_collections;
use ic_cdk::futures::spawn;
use ic_cdk::trap;
use junobuild_satellite::OnSetDocContext;
use rquickjs::{Ctx, Error as JsError};

#[no_mangle]
pub extern "Rust" fn juno_on_set_doc(context: OnSetDocContext) {
    spawn(async move {
        let execute_context = AsyncJsFnContext { context };

        if let Err(e) = execute_async_js(execute_context).await {
            trap(&e.to_string());
        }
    });
}

pub struct AsyncJsFnContext {
    pub context: OnSetDocContext,
}

impl RunAsyncJsFn for AsyncJsFnContext {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), JsError> {
        init_sdk(ctx)?;

        OnSetDoc.execute(ctx, self.context.clone()).await
    }
}

#[no_mangle]
pub extern "Rust" fn juno_on_set_doc_collections() -> Option<Vec<String>> {
    let collections = get_on_set_doc_collections();
    Some(collections)
}

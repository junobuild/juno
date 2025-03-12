use crate::hooks::js::loaders::init_loaders;
use crate::hooks::js::runtime::on_post_upgrade::execute_on_post_upgrade;
use crate::js::runtime::execute_async_js;
use crate::js::types::RunAsyncJsFn;
use ic_cdk::spawn;
use junobuild_macros::on_post_upgrade;
use rquickjs::Ctx;

// TODO: can be converted to async?
#[on_post_upgrade]
fn on_post_upgrade() {
    spawn(async {
        let execute_context = AsyncFnContext;

        if let Err(e) = execute_async_js(execute_context).await {
            ic_cdk::trap(&format!("on_post_upgrade failed: {:#}", e));
        }
    });
}

pub struct AsyncFnContext;

impl RunAsyncJsFn for AsyncFnContext {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), String> {
        init_loaders(ctx).map_err(|e| e.to_string())?;

        execute_on_post_upgrade(&ctx)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }
}

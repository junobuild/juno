use rquickjs::{Ctx, Error as JsError};

pub trait RunAsyncJsFn {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), JsError>;
}

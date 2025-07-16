use rquickjs::{Ctx, Error as JsError};

pub trait JsHook {
    fn get_loader_code(&self) -> String;
}

pub trait AssertJsHook<T> {
    fn execute<'js>(&self, ctx: &Ctx<'js>, context: T) -> Result<(), JsError>;
}

pub trait OnJsHook<T> {
    async fn execute<'js>(&self, ctx: &Ctx<'js>, context: T) -> Result<(), JsError>;
}

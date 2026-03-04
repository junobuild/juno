use rquickjs::{Ctx, Error as JsError};

pub trait JsCustomFunction {
    fn get_code(&self) -> String;
}

pub trait JsCustomFunctionSync<A, R> {
    fn execute<'js>(&self, ctx: &Ctx<'js>, args: A) -> Result<R, JsError>;
}

pub trait AsyncJsCustomFunction<T> {
    async fn execute<'js>(&self, ctx: &Ctx<'js>, context: T) -> Result<(), JsError>;
}

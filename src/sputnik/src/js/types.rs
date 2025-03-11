use rquickjs::Ctx;

pub trait RunAsyncJsFn {
    async fn run<'js>(&self, ctx: &Ctx<'js>) -> Result<(), String>;
}

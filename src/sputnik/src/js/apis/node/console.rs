use ic_cdk::print;
use rquickjs::{Ctx, Error as JsError, Result as JsResult, String};

pub fn init_console_log(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set("__juno_console_log", js_console_log)?;

    // TODO: use jsonReplace

    let result = ctx.eval::<(), _>(
        r#"
const __juno_console_map_args = (v) => v.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(" ");

globalThis.console = {
  info(...v) {
    const msg = __juno_console_map_args(v);
    globalThis.__juno_console_log(msg);
  },
  log(...v) {
    const msg = __juno_console_map_args(v);
    globalThis.__juno_console_log(msg);
  },
  warn(...v) {
    const msg = __juno_console_map_args(v);
    globalThis.__juno_console_log(msg);
  },
  error(...v) {
    const msg = __juno_console_map_args(v);
    globalThis.__juno_console_log(msg);
  }
}
"#,
    );

    result
}

#[rquickjs::function]
async fn console_log<'js>(_ctx: Ctx<'js>, msg: String<'js>) -> JsResult<()> {
    print(format!("{}", &msg.to_string()?));

    Ok(())
}

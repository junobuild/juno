use ic_cdk::print;
use rquickjs::{Ctx, Error as JsError, Result as JsResult, String};

pub fn init_console_log(ctx: &Ctx) -> Result<(), JsError> {
    // TODO: use jsonReplace

    let result = ctx.eval::<(), _>(
        r#"
const __juno_console_log = (v) => {
    const msg = v.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(" ");
    globalThis.__ic_cdk_print(msg);
}

globalThis.console = {
  info(...v) {
    __juno_console_log(v);
  },
  log(...v) {
    __juno_console_log(v);
  },
  warn(...v) {
    __juno_console_log(v);
  },
  error(...v) {
    __juno_console_log(v);
  }
}
"#,
    );

    result
}

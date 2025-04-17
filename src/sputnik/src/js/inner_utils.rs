use rquickjs::{Ctx, Error as JsError, Exception};

pub fn throw_js_exception<'js, T: std::fmt::Display>(
    ctx: &Ctx<'js>,
    error_code: &str,
    error: T,
) -> JsError {
    Exception::throw_message(ctx, &format_js_error(error_code, error))
}

pub fn format_js_error<T: std::fmt::Display>(error_code: &str, error: T) -> String {
    format!("{}\n  → {}", error_code, error)
}

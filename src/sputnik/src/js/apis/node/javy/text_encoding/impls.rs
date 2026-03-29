use rquickjs::prelude::Rest;
use rquickjs::{Ctx, Value};

/// A struct to hold the current [`Ctx`] and [`Value`]s passed as arguments to Rust
/// functions.
/// A struct here is used to explicitly tie these values with a particular
/// lifetime.
//
// See: https://github.com/rust-lang/rfcs/pull/3216
pub struct Args<'js>(Ctx<'js>, Rest<Value<'js>>);

impl<'js> Args<'js> {
    /// Tie the [Ctx] and [Rest<Value>].
    pub fn hold(cx: Ctx<'js>, args: Rest<Value<'js>>) -> Self {
        Self(cx, args)
    }

    /// Get the [Ctx] and [Rest<Value>].
    pub fn release(self) -> (Ctx<'js>, Rest<Value<'js>>) {
        (self.0, self.1)
    }
}

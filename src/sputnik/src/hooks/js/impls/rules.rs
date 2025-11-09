use crate::hooks::js::types::rules::JsMemory;
use junobuild_collections::types::rules::Memory;
use rquickjs::{Ctx, Error as JsError, FromJs, Result as JsResult, Value};

impl JsMemory {
    pub fn to_memory(&self) -> JsResult<Memory> {
        match self {
            JsMemory::Heap => Ok(Memory::Heap),
            JsMemory::Stable => Ok(Memory::Stable),
        }
    }
}

// ---------------------------------------------------------
// FromJs
// ---------------------------------------------------------

impl<'js> FromJs<'js> for JsMemory {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> JsResult<Self> {
        let s: String = String::from_js(ctx, value)?;

        match s.as_str() {
            "heap" => Ok(Self::Heap),
            "stable" => Ok(Self::Stable),
            _ => Err(JsError::new_from_js("JsMemory", "Memory")),
        }
    }
}

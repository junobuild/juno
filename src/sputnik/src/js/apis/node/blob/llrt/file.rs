// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
use crate::js::apis::node::blob::llrt::utils::time;
use rquickjs::{
    atom::PredefinedAtom, class::Trace, function::Opt, ArrayBuffer, Coerced, Ctx, Exception,
    Result, Value,
};

use super::polyfill::Blob;

#[rquickjs::class]
#[derive(Trace, Clone, rquickjs::JsLifetime)]
pub struct File {
    #[qjs(skip_trace)]
    blob: Blob,
    filename: String,
    last_modified: i64,
}

#[rquickjs::methods]
impl File {
    #[qjs(constructor)]
    fn new<'js>(
        ctx: Ctx<'js>,
        data: Value<'js>,
        filename: Coerced<String>,
        options: Opt<Value<'js>>,
    ) -> Result<Self> {
        let mut last_modified = time::now_millis();

        if let Some(ref opts) = options.0 {
            if opts.is_bool() || opts.is_float() || opts.is_int() || opts.is_string() {
                return Err(Exception::throw_type(&ctx, "Invalid options"));
            }

            if let Some(v) = opts.as_object() {
                if let Some(x) = v.get::<_, Option<Coerced<i64>>>("lastModified")? {
                    last_modified = x.0;
                }
            }
        }

        let blob = Blob::new(ctx, Opt(Some(data)), options)?;

        Ok(Self {
            blob,
            filename: filename.0,
            last_modified,
        })
    }

    #[qjs(get)]
    pub fn size(&self) -> usize {
        self.blob.size()
    }

    #[qjs(get)]
    pub fn name(&self) -> String {
        self.filename.clone()
    }

    #[qjs(get, rename = "type")]
    pub fn mime_type(&self) -> String {
        self.blob.mime_type()
    }

    #[qjs(get, rename = "lastModified")]
    pub fn last_modified(&self) -> i64 {
        self.last_modified
    }

    pub fn slice(&self, start: Opt<isize>, end: Opt<isize>, content_type: Opt<String>) -> Blob {
        self.blob.slice(start, end, content_type)
    }

    pub async fn text(&mut self) -> String {
        self.blob.text().await
    }

    #[qjs(rename = "arrayBuffer")]
    pub async fn array_buffer<'js>(&self, ctx: Ctx<'js>) -> Result<ArrayBuffer<'js>> {
        self.blob.array_buffer(ctx).await
    }

    pub async fn bytes<'js>(&self, ctx: Ctx<'js>) -> Result<Value<'js>> {
        self.blob.bytes(ctx).await
    }

    #[qjs(get, rename = PredefinedAtom::SymbolToStringTag)]
    pub fn to_string_tag(&self) -> &'static str {
        stringify!(File)
    }
}

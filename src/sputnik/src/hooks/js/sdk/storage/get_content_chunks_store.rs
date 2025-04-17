use crate::hooks::js::types::primitives::JsUsize;
use crate::hooks::js::types::rules::JsMemory;
use crate::hooks::js::types::storage::{JsAssetEncoding, JsBlob};
use junobuild_satellite::get_content_chunks_store as get_content_chunks_store_sdk;
use rquickjs::{Ctx, Error as JsError, Result as JsResult};

pub fn init_get_content_chunks_store(ctx: &Ctx) -> Result<(), JsError> {
    let global = ctx.globals();

    global.set(
        "__juno_satellite_storage_get_content_chunks_store",
        js_get_content_chunks_store,
    )?;

    Ok(())
}

#[rquickjs::function]
fn get_content_chunks_store<'js>(
    ctx: Ctx<'js>,
    encoding: JsAssetEncoding<'js>,
    chunk_index: JsUsize,
    memory: JsMemory,
) -> JsResult<Option<JsBlob<'js>>> {
    let result = get_content_chunks_store_sdk(
        &encoding.to_encoding()?,
        chunk_index.to_usize(),
        &memory.to_memory()?,
    );

    result
        .map(|blob| JsBlob::from_bytes(&ctx, &blob))
        .transpose()
}

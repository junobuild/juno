use crate::hooks::js::runtime::assert_set_doc::AssertSetDoc;
use crate::hooks::js::runtime::types::AssertJsHook;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::execute_sync_js;
use crate::state::store::get_assert_set_docs_collections;
use junobuild_satellite::AssertSetDocContext;

#[no_mangle]
pub extern "Rust" fn juno_assert_set_doc(context: AssertSetDocContext) -> Result<(), String> {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        AssertSetDoc
            .execute(ctx, context.clone())
            .map_err(|e| e.to_string())?;

        Ok(())
    })
    .map_err(|e| e.to_string())
}

#[no_mangle]
pub extern "Rust" fn juno_assert_set_doc_collections() -> Option<Vec<String>> {
    let collections = get_assert_set_docs_collections();

    Some(collections)
}

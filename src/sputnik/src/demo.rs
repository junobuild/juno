use candid::Principal;
use crate::hooks::js::sdk::init_sdk;
use crate::js::runtime::execute_sync_js;
use junobuild_shared::ic::UnwrapOrTrap;

#[ic_cdk::query]
fn world_world(input: Principal) {
    execute_sync_js(|ctx| {
        init_sdk(ctx).map_err(|e| e.to_string())?;

        // TODO

        Ok(())
    }).unwrap_or_trap()
}
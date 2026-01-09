use crate::cycles::convert::convert_icp_to_cycles as convert_icp_to_cycles_console;
use crate::guards::caller_has_account;
use crate::types::interface::ConvertIcpToCyclesArgs;
use ic_cdk_macros::update;
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;

#[update(guard = "caller_has_account")]
async fn convert_icp_to_cycles(args: ConvertIcpToCyclesArgs) {
    let caller = caller();

    convert_icp_to_cycles_console(caller, &args)
        .await
        .unwrap_or_trap()
}

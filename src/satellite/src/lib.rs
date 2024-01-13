use ic_cdk::print;
use ic_cdk_macros::export_candid;
use junobuild_macros::init_satellite;
use junobuild_satellite::include_satellite;
use junobuild_satellite::types::hooks::DocHooks;

struct MyDocHooks;

impl DocHooks for MyDocHooks {
    fn on_set_doc(&self) {
        print("On set doc called!");
    }
}

#[init_satellite]
fn init() -> Box<dyn DocHooks> {
    print("Crate register");
    Box::new(MyDocHooks)
}

include_satellite!();

export_candid!();

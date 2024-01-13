use ic_cdk::print;
use ic_cdk_macros::export_candid;
use junobuild_macros::init_satellite;
use junobuild_satellite::include_satellite;
use junobuild_satellite::types::hooks::SatelliteHooks;

struct MyHooks;

impl SatelliteHooks for MyHooks {
    fn on_set_doc(&self) {
        print("On set doc called!");
    }
}

#[init_satellite]
fn init() -> Box<dyn SatelliteHooks> {
    print("Crate register");
    Box::new(MyHooks)
}

include_satellite!();

export_candid!();

use ic_cdk::print;
use junobuild_macros::init_satellite;
use junobuild_satellite::types::hooks::SatelliteHooks;

struct MyHooks;

impl SatelliteHooks for MyHooks {
    fn on_set_doc(&self) {
        print("On set doc called!");
    }
}

#[init_satellite]
fn init() -> Box<dyn SatelliteHooks> {
    Box::new(MyHooks)
}

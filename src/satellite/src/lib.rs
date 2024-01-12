use ic_cdk::print;
use ic_cdk_macros::{export_candid, init, post_upgrade};
use junobuild_satellite::{include_satellite, init_satellite, post_upgrade_satellite};
use junobuild_satellite::triggers::set_triggers;
use junobuild_satellite::types::trigger::DocTrigger;

struct MyDocTrigger;

impl DocTrigger for MyDocTrigger {
    fn on_set_doc(&self) {
        print("On set doc called!");
    }
}

// TODO: post_upgrade really?

#[init]
fn init() {
    init_satellite();
}

#[post_upgrade]
fn post_upgrade() {
    let triggers = Box::new(MyDocTrigger);

    post_upgrade_satellite();
    set_triggers(triggers);
}

include_satellite!();

// Generate did files

export_candid!();

use std::sync::Mutex;
use lazy_static::lazy_static;
use crate::types::trigger::DocTrigger;

lazy_static! {
    static ref TRIGGERS: Mutex<Option<Box<dyn DocTrigger>>> = Mutex::new(None);
}

pub fn set_triggers(triggers: Box<dyn DocTrigger>) {
    let mut triggers_storage = TRIGGERS.lock().unwrap();
    *triggers_storage = Some(triggers);
}

pub fn invoke_trigger() {
    let trigger = TRIGGERS.lock().unwrap();

    if let Some(ref trigger) = *trigger {
        trigger.on_set_doc();
    }
}
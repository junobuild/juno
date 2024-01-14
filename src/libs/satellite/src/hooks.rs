use crate::db::types::state::Doc;
use crate::types::hooks::SatelliteHooks;
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref HOOKS: Mutex<Option<Box<dyn SatelliteHooks>>> = Mutex::new(None);
}

pub fn register_hooks(hooks: Box<dyn SatelliteHooks>) {
    let mut heap_hooks = HOOKS.lock().unwrap();
    *heap_hooks = Some(hooks);
}

pub fn invoke_hook(doc: Doc) {
    let hook = HOOKS.lock().unwrap();

    if let Some(ref hook) = *hook {
        hook.on_set_doc(doc);
    }
}

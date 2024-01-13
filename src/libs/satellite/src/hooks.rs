use std::sync::Mutex;
use lazy_static::lazy_static;
use crate::types::hooks::DocHooks;

lazy_static! {
    static ref HOOKS: Mutex<Option<Box<dyn DocHooks >>> = Mutex::new(None);
}

pub fn register_hooks(hooks: Box<dyn DocHooks>) {
    let mut heap_hooks = HOOKS.lock().unwrap();
    *heap_hooks = Some(hooks);
}

pub fn invoke_hook() {
    let hook = HOOKS.lock().unwrap();

    if let Some(ref hook) = *hook {
        hook.on_set_doc();
    }
}
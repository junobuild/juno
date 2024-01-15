use crate::db::types::state::Doc;
use ic_cdk::print;

extern "Rust" {
    fn juno_on_set_doc(doc: Doc);
}

pub fn invoke_hook(doc: Doc) {
    print("About to invoke");

    unsafe {
        juno_on_set_doc(doc);
    }
}

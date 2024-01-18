use crate::db::types::state::Doc;
use ic_cdk::print;

extern "Rust" {
    fn juno_on_set_doc(doc: Doc);
    fn juno_on_delete_doc(doc: Option<Doc>);
}

pub fn invoke_on_set_doc(doc: Doc) {
    print("About to invoke set");

    unsafe {
        juno_on_set_doc(doc);
    }
}

pub fn invoke_on_delete_doc(doc: Option<Doc>) {
    print("About to invoke delete");

    unsafe {
        juno_on_delete_doc(doc);
    }
}
use crate::db::types::state::Doc;
use ic_cdk::print;

extern "Rust" {
    fn juno_on_set_doc(doc: Doc);
    fn juno_on_delete_doc(doc: Option<Doc>);
}

pub fn invoke_on_set_doc(doc: Doc) {
    print("About to invoke set");

    #[cfg(not(feature = "disable_on_set_doc"))]
    {
        unsafe {
            juno_on_set_doc(doc);
        }
    }
}

pub fn invoke_on_delete_doc(doc: Option<Doc>) {
    print("About to invoke delete");

    #[cfg(not(feature = "disable_on_delete_doc"))]
    {
        unsafe {
            juno_on_delete_doc(doc);
        }
    }
}
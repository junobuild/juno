use crate::db::types::state::Doc;
use crate::types::core::Key;

extern "Rust" {
    fn juno_on_set_doc(doc: Doc);
    fn juno_on_set_many_docs(docs: Vec<(Key, Doc)>);
    fn juno_on_delete_doc(doc: Option<Doc>);
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_set_doc(doc: Doc) {
    #[cfg(not(feature = "disable_on_set_doc"))]
    {
        unsafe {
            juno_on_set_doc(doc);
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_set_many_docs(docs: Vec<(Key, Doc)>) {
    #[cfg(not(feature = "disable_on_set_many_docs"))]
    {
        unsafe {
            juno_on_set_many_docs(docs);
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_doc(doc: Option<Doc>) {
    #[cfg(not(feature = "disable_on_delete_doc"))]
    {
        unsafe {
            juno_on_delete_doc(doc);
        }
    }
}

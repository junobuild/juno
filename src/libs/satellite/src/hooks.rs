#![allow(dead_code)]

use crate::db::types::state::{Doc, DocContext};
use crate::HookContext;
use shared::types::state::UserId;

extern "Rust" {
    fn juno_on_set_doc(context: HookContext<DocContext<Doc>>);
    fn juno_on_set_many_docs(context: HookContext<Vec<DocContext<Doc>>>);
    fn juno_on_delete_doc(context: HookContext<DocContext<Option<Doc>>>);
    fn juno_on_delete_many_docs(context: HookContext<Vec<DocContext<Option<Doc>>>>);
}

#[allow(unused_variables)]
pub fn invoke_on_set_doc(caller: &UserId, doc: &DocContext<Doc>) {
    #[cfg(not(feature = "disable_on_set_doc"))]
    {
        let context: HookContext<DocContext<Doc>> = HookContext::<DocContext<Doc>> {
            caller: caller.clone(),
            data: doc.clone(),
        };

        unsafe {
            juno_on_set_doc(context);
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_set_many_docs(caller: &UserId, docs: &Vec<DocContext<Doc>>) {
    #[cfg(not(feature = "disable_on_set_many_docs"))]
    {
        let context: HookContext<Vec<DocContext<Doc>>> = HookContext::<Vec<DocContext<Doc>>> {
            caller: caller.clone(),
            data: docs.clone(),
        };

        unsafe {
            juno_on_set_many_docs(context);
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_doc(caller: &UserId, doc: &DocContext<Option<Doc>>) {
    #[cfg(not(feature = "disable_on_delete_doc"))]
    {
        let context: HookContext<DocContext<Option<Doc>>> = HookContext::<DocContext<Option<Doc>>> {
            caller: caller.clone(),
            data: doc.clone(),
        };

        unsafe {
            juno_on_delete_doc(context);
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_many_docs(caller: &UserId, docs: &Vec<DocContext<Option<Doc>>>) {
    #[cfg(not(feature = "disable_on_delete_many_docs"))]
    {
        let context: HookContext<Vec<DocContext<Option<Doc>>>> =
            HookContext::<Vec<DocContext<Option<Doc>>>> {
                caller: caller.clone(),
                data: docs.clone(),
            };

        unsafe {
            juno_on_delete_many_docs(context);
        }
    }
}

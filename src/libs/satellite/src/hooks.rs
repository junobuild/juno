#![allow(dead_code)]

use crate::db::types::state::{Doc, DocContext};
use crate::types::hooks::{
    OnDeleteDocContext, OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext,
};
use crate::HookContext;
use ic_cdk_timers::set_timer;
use shared::types::state::UserId;
use std::time::Duration;

extern "Rust" {
    fn juno_on_set_doc(context: OnSetDocContext);
    fn juno_on_set_many_docs(context: OnSetManyDocsContext);
    fn juno_on_delete_doc(context: OnDeleteDocContext);
    fn juno_on_delete_many_docs(context: OnDeleteManyDocsContext);

    fn juno_should_invoke_on_set_doc(context: &OnSetDocContext) -> bool;
    fn juno_should_invoke_set_many_docs(context: &OnSetManyDocsContext) -> bool;
    fn juno_should_invoke_on_delete_doc(context: &OnDeleteDocContext) -> bool;
    fn juno_should_invoke_on_delete_many_docs(context: &OnDeleteManyDocsContext) -> bool;
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
            if juno_should_invoke_on_set_doc(&context) {
                set_timer(Duration::from_nanos(0), || {
                    juno_on_set_doc(context);
                });
            }
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
            if juno_should_invoke_on_set_doc(&context) {
                set_timer(Duration::from_nanos(0), || {
                    juno_on_set_many_docs(context);
                });
            }
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
            if juno_should_invoke_on_delete_doc(&context) {
                set_timer(Duration::from_nanos(0), || {
                    juno_on_delete_doc(context);
                });
            }
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
            set_timer(Duration::from_nanos(0), || {
                juno_on_delete_many_docs(context);
            });
        }
    }
}

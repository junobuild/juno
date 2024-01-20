#![allow(dead_code)]

use crate::db::store::get_rule_store;
use crate::db::types::state::{Doc, DocContext};
use crate::types::hooks::{
    OnDeleteDocContext, OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext,
};
use crate::{CollectionKey, HookContext};
use ic_cdk_timers::set_timer;
use shared::types::state::UserId;
use std::time::Duration;

extern "Rust" {
    fn juno_on_set_doc(context: OnSetDocContext);
    fn juno_on_set_many_docs(context: OnSetManyDocsContext);
    fn juno_on_delete_doc(context: OnDeleteDocContext);
    fn juno_on_delete_many_docs(context: OnDeleteManyDocsContext);
}

#[allow(unused_variables)]
pub fn invoke_on_set_doc(caller: &UserId, doc: &DocContext<Doc>) {
    #[cfg(not(feature = "disable_on_set_doc"))]
    {
        if should_invoke_hooks(&doc.collection) {
            let context: HookContext<DocContext<Doc>> = HookContext::<DocContext<Doc>> {
                caller: caller.clone(),
                data: doc.clone(),
            };

            unsafe {
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
            set_timer(Duration::from_nanos(0), || {
                juno_on_set_many_docs(context);
            });
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_doc(caller: &UserId, doc: &DocContext<Option<Doc>>) {
    #[cfg(not(feature = "disable_on_delete_doc"))]
    {
        if should_invoke_hooks(&doc.collection) {
            let context: HookContext<DocContext<Option<Doc>>> =
                HookContext::<DocContext<Option<Doc>>> {
                    caller: caller.clone(),
                    data: doc.clone(),
                };

            unsafe {
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

pub fn should_invoke_hooks(collection: &CollectionKey) -> bool {
    let rule = get_rule_store(collection);

    match rule {
        Ok(rule) => rule.invoke_hooks.unwrap_or(false),
        Err(_) => {
            // We ignore the error and do not call the hook. Returning an error to the user that called the original function wouldn't probably be that meaningful for them.
            false
        }
    }
}

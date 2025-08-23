use crate::db::types::state::DocContext;
use crate::user::usage::delete_user_usage;
use crate::Doc;
use ic_cdk::trap;
use ic_cdk_timers::set_timer;
use junobuild_collections::constants::db::COLLECTION_USER_KEY;
use junobuild_shared::types::state::UserId;
use std::time::Duration;

pub fn invoke_on_delete_user(doc: &DocContext<Option<Doc>>) {
    invoke_deletion(doc);
}

pub fn invoke_on_delete_many_users(docs: &[DocContext<Option<Doc>>]) {
    docs.iter().for_each(invoke_deletion);
}

fn invoke_deletion(doc: &DocContext<Option<Doc>>) {
    if doc.collection != COLLECTION_USER_KEY {
        return;
    }

    if let Some(user) = &doc.data {
        invoke_cleanup_user(&user.owner);
    }
}

fn invoke_cleanup_user(user_id: &UserId) {
    let user_id = *user_id;

    set_timer(Duration::ZERO, move || {
        delete_user_usage(&user_id).unwrap_or_else(|e| trap(&e))
    });
}

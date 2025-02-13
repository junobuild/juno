use junobuild_collections::constants::db::COLLECTION_USER_KEY;
use crate::db::types::state::DocContext;
use crate::Doc;
use crate::user::usage::internal_hooks::invoke_delete_user_usage;

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
        invoke_delete_user_usage(&user.owner);
    }
}
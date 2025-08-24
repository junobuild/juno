use crate::db::types::state::DocContext;
use crate::user::usage::internal_hooks::invoke_delete_user_usage;
use crate::user::webauthn::delete_user_webauthn_and_index;
use crate::Doc;
use junobuild_collections::constants::db::COLLECTION_USER_KEY;

pub fn on_delete_user(doc: &DocContext<Option<Doc>>) -> Result<(), String> {
    invoke_deletion(doc)
}

pub fn on_delete_many_users(docs: &[DocContext<Option<Doc>>]) -> Result<(), String> {
    docs.iter().try_for_each(invoke_deletion)
}

fn invoke_deletion(doc: &DocContext<Option<Doc>>) -> Result<(), String> {
    if doc.collection != COLLECTION_USER_KEY {
        return Ok(());
    }

    if let Some(user) = &doc.data {
        // We want to delete the potential webauthn related data atomically
        // as they are part of the user authentication process.
        delete_user_webauthn_and_index(&user.owner)?;

        invoke_delete_user_usage(&user.owner);
    }

    Ok(())
}

use crate::db::types::state::DocContext;
use crate::user::usage::internal_hooks::invoke_delete_user_usage;
use crate::user::webauthn::store::{delete_user_webauthn_and_index, set_user_webauthn_index};
use crate::{Doc, DocUpsert};
use junobuild_collections::constants::db::{COLLECTION_USER_KEY, COLLECTION_USER_WEBAUTHN_KEY};

pub fn on_set_user(doc: &DocContext<DocUpsert>) -> Result<(), String> {
    link_user_webauthn(doc)
}

pub fn on_set_many_users(docs: &[DocContext<DocUpsert>]) -> Result<(), String> {
    docs.iter().try_for_each(link_user_webauthn)
}

pub fn on_delete_user(doc: &DocContext<Option<Doc>>) -> Result<(), String> {
    cleanup_user(doc)
}

pub fn on_delete_many_users(docs: &[DocContext<Option<Doc>>]) -> Result<(), String> {
    docs.iter().try_for_each(cleanup_user)
}

fn link_user_webauthn(doc: &DocContext<DocUpsert>) -> Result<(), String> {
    if doc.collection != COLLECTION_USER_WEBAUTHN_KEY {
        return Ok(());
    }

    set_user_webauthn_index(&doc.data.after.owner, &doc.key)?;

    Ok(())
}

fn cleanup_user(doc: &DocContext<Option<Doc>>) -> Result<(), String> {
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

use crate::get_doc_store;
use crate::user::types::state::{BannedReason, UserAdmin};
use candid::Principal;
use ic_cdk::id;
use junobuild_collections::constants::USER_ADMIN_COLLECTION_KEY;
use junobuild_utils::decode_doc_data;

pub fn assert_user_is_not_banned(caller: Principal) -> Result<(), String> {
    let user_key = caller.to_text();

    let doc = get_doc_store(id(), USER_ADMIN_COLLECTION_KEY.to_string(), user_key)?;

    if let Some(doc) = doc {
        let current_admin = decode_doc_data::<UserAdmin>(&doc.data)?;

        if let Some(BannedReason::Indefinite) = current_admin.banned {
            return Err(format!("User {} is banned.", caller));
        }
    }

    Ok(())
}

use crate::db::internal::unsafe_get_doc;
use crate::db::store::internal_set_doc_store;
use crate::db::types::store::AssertSetDocOptions;
use crate::errors::user::JUNO_DATASTORE_ERROR_USER_REGISTER_PROVIDER_INVALID_DATA;
use crate::rules::store::get_rule_db;
use crate::user::core::types::state::{AuthProvider, OpenIdData, ProviderData, UserData};
use crate::Doc;
use candid::Principal;
use junobuild_auth::delegation::types::UserKey;
use junobuild_auth::openid::types::interface::OpenIdCredential;
use junobuild_collections::constants::db::COLLECTION_USER_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_shared::ic::api::id;
use junobuild_utils::decode_doc_data;

pub fn register_user(public_key: &UserKey, credential: &OpenIdCredential) -> Result<Doc, String> {
    let user_collection = COLLECTION_USER_KEY.to_string();

    let rule = get_rule_db(&user_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_collection))?;

    let user_id = Principal::self_authenticating(public_key);
    let user_key = user_id.to_text();

    let current_user = unsafe_get_doc(&user_collection.to_string(), &user_key, &rule)?;

    let current_user_data = if let Some(current_user) = &current_user {
        Some(decode_doc_data::<UserData>(&current_user.data)?)
    } else {
        None
    };

    // We clone the banned flag for the state of the art as the assertion
    // read the flag from the state anyway. Therefore, even if we would incorrectly
    // set None here for a banned user, the assertion triggered by set_doc_store would
    // still fail.
    // See `assert_user_is_not_banned` for details.
    let banned = current_user_data
        .as_ref()
        .and_then(|user_data| user_data.banned.clone());

    let existing_provider_data: Option<&OpenIdData> = match current_user_data.as_ref() {
        None => None, // A new user
        Some(user_data) => match user_data.provider_data.as_ref() {
            Some(ProviderData::OpenId(provider_data)) => Some(provider_data),
            _ => return Err(JUNO_DATASTORE_ERROR_USER_REGISTER_PROVIDER_INVALID_DATA.to_string()),
        },
    };

    // If the credential data are unchanged and user already exists, we can return it
    // without any updates.
    if let (Some(existing_provider_data), Some(current_user)) =
        (existing_provider_data, current_user.as_ref())
    {
        let new_provider_data = OpenIdData::from(credential);

        if *existing_provider_data == new_provider_data {
            return Ok(current_user.clone());
        }
    }

    // Merge or define new provider data.
    let provider_data = if let Some(existing_provider_data) = existing_provider_data {
        OpenIdData::merge(existing_provider_data, credential)
    } else {
        OpenIdData::from(credential)
    };

    // The document should be created on behalf of the user, meaning the owner must be the user's public key.
    // However, only an administrator is currently allowed to update user data.
    // See `assert_user_collection_write_permission` for details.
    let caller = if existing_provider_data.is_some() {
        id()
    } else {
        user_id
    };

    // Create or update the user.
    let user_data: UserData = UserData {
        banned,
        provider: Some(AuthProvider::Google),
        provider_data: Some(ProviderData::OpenId(provider_data)),
    };

    let user_data = UserData::prepare_set_doc(&user_data, &current_user)?;

    let assert_options = AssertSetDocOptions {
        // We disable the assertion for the rate tokens because it has been asserted
        // before generating the delegation.
        with_assert_rate: false,
    };

    let result = internal_set_doc_store(
        caller,
        user_collection,
        user_key,
        user_data,
        &assert_options,
    )?;

    Ok(result.data.after)
}

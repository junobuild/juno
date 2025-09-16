use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::types::state::{
    Account, AccountRole, AccountsStable, AliasId, OwnerId, StableState, WebAuthnData,
};
use junobuild_shared::types::state::UserId;

pub fn owner_id_of(maybe_alias_id: &AliasId) -> Option<OwnerId> {
    read_stable_state(|stable| owner_id_of_impl(maybe_alias_id, &stable.accounts))
}

fn owner_id_of_impl(maybe_alias_id: &AliasId, accounts: &AccountsStable) -> Option<OwnerId> {
    if let Some(account) = accounts.get(maybe_alias_id) {
        if let AccountRole::Alias(alias) = &account.role {
            return Some(alias.owner_id);
        }
    }

    None
}

pub fn init_owner_account_from_webauthn(
    caller: &UserId,
    webauthn_data: &WebAuthnData,
) -> Option<Account> {
    mutate_stable_state(|stable| {
        init_owner_account_from_webauthn_impl(caller, webauthn_data, stable)
    })
}

fn init_owner_account_from_webauthn_impl(
    caller: &UserId,
    webauthn_data: &WebAuthnData,
    state: &mut StableState,
) -> Option<Account> {
    if let Some(existing_account) = state.accounts.get(caller) {
        return Some(existing_account);
    }

    let account = Account::new_owner_from_webauthn(&webauthn_data);

    state.accounts.insert(*caller, account.clone());

    Some(account)
}

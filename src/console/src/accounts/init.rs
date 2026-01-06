use crate::accounts::{get_optional_account, init_account as init_account_store};
use crate::rates::increment_mission_controls_rate;
use crate::types::state::Account;
use junobuild_shared::types::state::UserId;

pub fn get_or_init_account(user: &UserId) -> Result<Account, String> {
    if let Some(account) = get_optional_account(user)? {
        return Ok(account);
    }

    // Guard too many requests
    increment_mission_controls_rate()?;

    let account = init_account_store(user, &None);

    Ok(account)
}

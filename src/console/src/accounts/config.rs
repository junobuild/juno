use crate::constants::E8S_PER_ICP;
use crate::store::{with_account_config, with_account_config_mut};
use crate::types::interface::SetAccountConfig;
use crate::types::state::AccountConfig;
use ic_ledger_types::Tokens;

pub fn get_init_credits() -> Tokens {
    get_account_config()
        .map(|config| config.init_credits)
        .unwrap_or(E8S_PER_ICP)
}

pub fn get_account_config() -> Option<AccountConfig> {
    with_account_config(|account_config| account_config.clone())
}

pub fn set_account_config(proposed_config: &SetAccountConfig) -> AccountConfig {
    let current_config = get_account_config();

    let config = AccountConfig::prepare(&current_config, proposed_config);

    insert_account_config(&config);

    config
}

fn insert_account_config(config: &AccountConfig) {
    with_account_config_mut(|account_config| insert_account_impl(config, account_config))
}

fn insert_account_impl(update_config: &AccountConfig, account_config: &mut Option<AccountConfig>) {
    *account_config = Some(update_config.clone())
}

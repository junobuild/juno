use crate::auth::providers::assert_passkey_enabled;
use crate::auth::store::get_config;

pub fn provider_passkey_is_enabled() -> Result<(), String> {
    let config = get_config();
    assert_passkey_enabled(&config)
}

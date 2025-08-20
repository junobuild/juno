use crate::auth::store::{get_salt, set_salt};
use crate::random::runtime::salt;

pub fn init_auth_salt() {
    let existing_salt = get_salt();

    // Salt should be initialized only once.
    if existing_salt.is_some() {
        return;
    }

    // TODO: what do we do in case of error?
    if let Ok(salt) = salt() {
        set_salt(&salt);
    }
}

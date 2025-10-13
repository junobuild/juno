use crate::auth::store::{get_salt, set_salt};
use crate::random::runtime::salt;
use junobuild_shared::ic::api::print;

pub fn init_auth_salt() {
    let existing_salt = get_salt();

    // Salt should be initialized only once here.
    if existing_salt.is_some() {
        return;
    }

    if let Ok(salt) = salt() {
        set_salt(&salt);
    } else {
        // We only print an error because the salt can be added manually and this should not be a blocker for the upgrade.
        #[allow(clippy::disallowed_methods)]
        print("A salt could not be generated. Please set one manually in the authentication configuration.");
    }
}

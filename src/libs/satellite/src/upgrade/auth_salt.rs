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

        // We use this one-time log because the salt is not exposed, and we want to verify that it was generated correctly.
        #[allow(clippy::disallowed_methods)]
        print("Authentication salt generated.");
    } else {
        // We only log an error since the salt should not block the upgrade or affect production.
        // All existing features will continue to work; only the new authentication method will not be available.
        #[allow(clippy::disallowed_methods)]
        print("A salt for the authentication could not be generated. Please reach out Juno!");
    }
}

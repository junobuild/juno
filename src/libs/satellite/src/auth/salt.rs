use crate::auth::store::{get_salt, set_salt};
use junobuild_shared::ic::api::print;
use junobuild_shared::random::raw_rand;

pub async fn init_salt() -> Result<(), String> {
    let existing_salt = get_salt();

    // Salt should be initialized only once.
    if existing_salt.is_some() {
        #[allow(clippy::disallowed_methods)]
        print("Authentication salt exists. Skipping initialization.");
        return Ok(());
    }

    let salt = raw_rand()
        .await
        .map_err(|e| format!("Failed to obtain authentication seed: {:?}", e))?;

    set_salt(&salt);

    #[allow(clippy::disallowed_methods)]
    print("Authentication salt initialized.");

    Ok(())
}

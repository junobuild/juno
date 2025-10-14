use junobuild_shared::ic::api::print;
use crate::auth::store::{get_salt, set_salt};
use crate::memory::services::with_runtime_rng;
use crate::random::init::init_random_seed;
use crate::random::runtime::salt;

pub async fn init_salt() -> Result<(), String> {
    let existing_salt = get_salt();

    // Salt should be initialized only once.
    if existing_salt.is_some() {
        #[allow(clippy::disallowed_methods)]
        print("Authentication salt exists. Skipping initialization.");
        return Ok(());
    }

    let rng = with_runtime_rng(|rng| rng.clone());

    if rng.is_none() {
        init_random_seed().await;
    }

    let s = salt()?;
    set_salt(&s);

    #[allow(clippy::disallowed_methods)]
    print("Authentication salt initialized.");

    Ok(())
}
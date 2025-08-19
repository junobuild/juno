use crate::hooks::random::invoke_on_init_random_seed;
use crate::random::runtime::salt;
use junobuild_auth::seed::init_salt;

pub fn post_init_random_seed() {
    init_auth_seed();

    invoke_on_init_random_seed();
}

fn init_auth_seed() {
    // TODO: what do we do in case of error?
    let salt = salt().ok();

    init_salt(salt);
}

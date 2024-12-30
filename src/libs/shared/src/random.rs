use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use rand::{rngs::StdRng, SeedableRng};

pub async fn get_random_seed() -> Option<StdRng> {
    let result: CallResult<([u8; 32],)> =
        call(Principal::management_canister(), "raw_rand", ()).await;

    match result {
        // We do nothing in case of error to not block initialization but, getrandom will throw errors
        Err(_) => None,
        Ok((seed,)) => Some(StdRng::from_seed(seed)),
    }
}

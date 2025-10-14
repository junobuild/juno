use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_cdk::management_canister;
use rand::{rngs::StdRng, SeedableRng};

pub async fn get_random_seed() -> Option<StdRng> {
    let result = raw_rand().await;

    match result {
        // We do nothing in case of error to not block initialization but, getrandom will throw errors
        Err(_) => None,
        Ok(seed) => Some(StdRng::from_seed(seed)),
    }
}

pub async fn raw_rand() -> Result<[u8; 32], String> {
    let bytes = management_canister::raw_rand()
        .await
        .map_err(|e| format!("raw_rand failed: {:?}", e))?;

    let seed: [u8; 32] = bytes
        .as_slice()
        .try_into()
        .map_err(|_| format!("raw_rand expected 32 bytes, got {}", bytes.len()))?;

    Ok(seed)
}

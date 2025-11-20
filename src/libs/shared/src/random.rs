use ic_cdk::management_canister;
use rand::{rngs::StdRng, SeedableRng};

/// Initializes a [`StdRng`] using 32 bytes of randomness retrieved from the IC management canister.
///
/// # Behavior
///
/// This function internally calls [`raw_rand()`] to obtain 32 bytes of randomness
/// from the management canister and uses them as a seed to create a deterministic
/// random number generator (`StdRng`).
///
/// If randomness cannot be retrieved (e.g., due to a call failure), the function
/// returns `None` instead of blocking initialization. This allows the caller to
/// proceed with limited functionality.
///
/// # Returns
///
/// - `Some(StdRng)` if randomness was successfully fetched.
/// - `None` if the management canister call failed.
///
/// # Example
///
/// ```ignore
/// if let Some(mut rng) = get_random_seed().await {
///     let value: u64 = rng.gen();
///     println!("Random value: {}", value);
/// }
/// ```
pub async fn get_random_seed() -> Option<StdRng> {
    let result = raw_rand().await;

    match result {
        // We do nothing in case of error to not block initialization but, getrandom will throw errors
        Err(_) => None,
        Ok(seed) => Some(StdRng::from_seed(seed)),
    }
}

/// Retrieves 32 bytes of randomness from the Internet Computer management canister.
///
/// # Behavior
///
/// Calls the management canister's [`raw_rand`](https://internetcomputer.org/docs/current/references/ic-interface-spec#ic-management-canister)
/// method, which returns 32 random bytes (256 bits) of cryptographically secure randomness.
/// These bytes can be used as a seed for random number generators or as a unique salt.
///
/// The function performs length validation to ensure the result is exactly 32 bytes.
///
/// # Returns
///
/// - `Ok([u8; 32])` containing the random seed bytes on success.
/// - `Err(String)` with an error message if the call failed or returned an unexpected length.
///
/// # Example
///
/// ```ignore
/// let seed = raw_rand().await?;
/// println!("Received 32 bytes of randomness: {:?}", seed);
/// ```
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

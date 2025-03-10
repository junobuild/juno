use ic_cdk::api::time;
use ic_wasi_polyfill::{init_seed, init_with_memory};
use junobuild_satellite::internal::register_polyfill_memory;
use junobuild_satellite::random;

/// ⚠️ Due to the need for a seed to initialize WASI, JavaScript canisters cannot be used by dApps such as lotteries, which require perfectly unpredictable randomness,
/// unless a new seed is generated for each use of JavaScript. However, this would result in excessive latency, as an extra `raw_rand` call
/// would be required each time.
///
/// We initialize the WASI polyfill with a random seed based on `time()` because it needs to be initialized in `init` and `post_upgrade` hooks
/// (within the lifecycle, not deferred). This is (probably) necessary because it (might) must be mounted before anything else and does not yet have an initialized random seed
/// (as it requires a call to `raw_rand`, which cannot be performed within this lifecycle).
/// Later on, as soon as the randomness is initialized, we will update the seed for better randomness.
pub fn init_wasi() {
    register_polyfill_memory(|memory| {
        let time = time();
        init_with_memory(&time.to_le_bytes(), &[], memory);
    });
}

pub fn update_wasi_seed() -> Result<(), String> {
    let random = random()?;
    let time = time();

    let mut seed = [0u8; 12];
    seed[..4].copy_from_slice(&random.to_le_bytes());
    seed[4..12].copy_from_slice(&time.to_le_bytes());

    init_seed(&seed);

    Ok(())
}

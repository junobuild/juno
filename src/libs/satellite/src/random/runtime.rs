use rand::{Rng, RngCore};
use crate::memory::services::{with_runtime_rng_mut};

/// Generates a random `i32` number.
///
/// # Returns
///
/// - `Ok(i32)` if the random number generator is available.
/// - `Err(String)` if the generator has not been initialized.
///
/// # Example
///
/// ```rust
/// let result = random();
/// match result {
///     Ok(num) => println!("Generated random number: {}", num),
///     Err(err) => eprintln!("Error: {}", err),
/// }
/// ```
pub fn random() -> Result<i32, String> {
    with_runtime_rng_mut(|rng| {
        match rng {
            None => Err("The random number generator has not been initialized.".to_string()),
            Some(rng) => Ok(rng.random()),
        }
    })
}

/// Generates a random 32-byte salt.
///
/// # Returns
///
/// - `Ok([u8; 32])` if the random number generator is available.
/// - `Err(String)` if the generator has not been initialized.
///
/// # Example
///
/// ```rust
/// let result = salt();
/// match result {
///     Ok(bytes) => println!("Generated salt of length: {}", bytes.len()),
///     Err(err) => eprintln!("Error: {}", err),
/// }
/// ```
pub fn salt() -> Result<[u8; 32], String> {
    with_runtime_rng_mut(|rng| {
        match rng {
            None => Err(
                "The random number generator has not been initialized. A salt cannot be generated."
                    .to_string(),
            ),
            Some(rng) => {
                let mut salt = [0u8; 32];
                rng.fill_bytes(&mut salt);
                Ok(salt)
            }
        }
    })
}

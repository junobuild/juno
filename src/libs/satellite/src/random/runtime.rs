use crate::memory::internal::STATE;
use rand::{Rng, RngCore};

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
    STATE.with(|state| {
        let rng = &mut state.borrow_mut().runtime.rng;

        match rng {
            None => Err("The random number generator has not been initialized.".to_string()),
            Some(rng) => Ok(rng.random()),
        }
    })
}

pub fn salt() -> Result<[u8; 32], String> {
    STATE.with(|state| {
        let rng = &mut state.borrow_mut().runtime.rng;

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

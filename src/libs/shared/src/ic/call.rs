use candid::{CandidType, Deserialize};
use ic_cdk::call::{CallFailed, Response};

/// Extension trait for decoding Candid responses from inter-canister calls.
///
/// This trait provides a convenient method to decode the response of an inter-canister call
/// into a Rust type, combining error handling for both call failures and decoding failures.
pub trait DecodeCandid {
    /// Decodes the response as a Candid type.
    ///
    /// This method handles both the call result and Candid decoding in a single step,
    /// converting any errors into descriptive string messages.
    ///
    /// # Type Parameters
    /// * `T` - The type to decode the response into. Must implement `CandidType` and `Deserialize`.
    ///
    /// # Returns
    /// * `Ok(T)` - The successfully decoded response.
    /// * `Err(String)` - An error message describing either the call failure or decoding failure.
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// # use ic_cdk::call::Call;
    /// # use candid::Principal;
    /// # async fn example() -> Result<u32, String> {
    /// # let canister_id = Principal::anonymous();
    /// let result: u32 = Call::bounded_wait(canister_id, "get_value")
    ///     .await
    ///     .decode_candid()?;
    /// # Ok(result)
    /// # }
    /// ```
    fn decode_candid<T>(self) -> Result<T, String>
    where
        T: CandidType + for<'de> Deserialize<'de>;
}

impl DecodeCandid for Result<Response, CallFailed> {
    fn decode_candid<T>(self) -> Result<T, String>
    where
        T: CandidType + for<'de> Deserialize<'de>,
    {
        self.map_err(|e| format!("Call failed: {:?}", e))?
            .candid::<T>()
            .map_err(|e| format!("Decoding failed: {:?}", e))
    }
}

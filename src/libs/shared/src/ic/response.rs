use candid::{encode_one, CandidType};
use ic_cdk::api::{msg_reject, msg_reply};
use ic_cdk::trap;
use std::marker::PhantomData;

/// Helper for replying or rejecting calls marked with `manual_reply = true`.
///
/// This struct mirrors the now-deprecated `ManualReply<T>` type from the
/// IC Rust CDK. It uses `PhantomData<T>` internally to preserve the correct
/// return type in the generated Candid interface, but never actually serializes
/// anything because you send the reply or reject manually.
///
/// # When to use
///
/// - Your method is annotated with `#[update(..., manual_reply = true)]`
///   or `#[query(..., manual_reply = true)]`.
/// - You want to send the reply or reject explicitly, rather than having
///   the CDK serialize and return your function's result automatically.
/// - You still want the generated `.did` file to correctly show the return type.
///
/// # Example
///
/// ```rust
/// #[update(manual_reply = true)]
/// fn my_method() -> ManualReply<()> {
///     if something_went_wrong() {
///         return ManualReply::reject("bad input");
///     }
///     ManualReply::one(())
/// }
/// ```
#[derive(Debug, Copy, Clone, Default)]
pub struct ManualReply<T: ?Sized>(PhantomData<T>);

impl<T: ?Sized> ManualReply<T> {
    /// Returns a `ManualReply<T>` without sending a reply or reject.
    ///
    /// Only useful once reply/reject were sent manually earlier.
    const fn done() -> Self {
        Self(PhantomData)
    }

    /// Sends a reply containing the given value as a single Candid return.
    ///
    /// # Example
    /// ```
    /// ManualReply::one(42u64); // replies with 42
    /// ```
    pub fn one<U>(value: U) -> Self
    where
        U: CandidType,
    {
        let bytes =
            encode_one(value).unwrap_or_else(|e| trap(format!("Candid encode failed: {e}")));
        msg_reply(bytes);
        Self::done()
    }

    /// Rejects the call with the given message (user-level reject).
    ///
    /// # Example
    /// ```
    /// ManualReply::reject("Not allowed");
    /// ```
    pub fn reject(message: impl AsRef<str>) -> Self {
        msg_reject(message.as_ref());
        Self::done()
    }
}

impl<T> CandidType for ManualReply<T>
where
    T: CandidType + ?Sized,
{
    fn _ty() -> candid::types::Type {
        T::_ty()
    }

    fn idl_serialize<S>(&self, _: S) -> Result<(), S::Error>
    where
        S: candid::types::Serializer,
    {
        Err(<S::Error as serde::ser::Error>::custom(
            "ManualReply cannot be serialized (manual_reply = true)",
        ))
    }
}

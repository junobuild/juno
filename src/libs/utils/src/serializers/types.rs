use candid::Principal as CandidPrincipal;

/// Represents a wrapper around the `candid::Principal` type.
///
/// This struct is designed to encapsulate a Candid Principal, allowing for
/// integration and usage within Juno hooks contexts.
///
/// # Fields
/// - `value`: The `Principal` this struct wraps.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct DocDataPrincipal {
    pub value: CandidPrincipal,
}

/// Represents a large integer value for document data, particularly useful for interacting with
/// languages or environments that support large numeric types, such as the `bigint` in JavaScript.
///
/// # Fields
/// - `value`: A `u64` integer representing the large numeric value encapsulated by this struct.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct DocDataBigInt {
    pub value: u64,
}

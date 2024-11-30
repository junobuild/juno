use ic_ledger_types::AccountIdentifier;

/// Checks if two account identifiers are equal.
///
/// # Arguments
/// * `x` - The first account identifier to compare.
/// * `y` - The second account identifier to compare.
///
/// # Returns
/// True if the account identifiers are equal; false otherwise.
pub fn account_identifier_equal(x: AccountIdentifier, y: AccountIdentifier) -> bool {
    x == y
}

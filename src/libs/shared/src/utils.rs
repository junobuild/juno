use candid::Principal;

/// Checks if two principals are not equal.
///
/// # Arguments
/// * `x` - The first principal to compare.
/// * `y` - The second principal to compare.
///
/// # Returns
/// True if the principals are not equal; false otherwise.
pub fn principal_not_equal(x: Principal, y: Principal) -> bool {
    x != y
}

/// Checks if two principals are equal.
///
/// # Arguments
/// * `x` - The first principal to compare.
/// * `y` - The second principal to compare.
///
/// # Returns
/// True if the principals are equal; false otherwise.
pub fn principal_equal(x: Principal, y: Principal) -> bool {
    x == y
}

/// Checks if a principal is not the anonymous principal.
///
/// # Arguments
/// * `p` - The principal to check.
///
/// # Returns
/// True if the principal is not anonymous; false otherwise.
pub fn principal_not_anonymous(p: Principal) -> bool {
    principal_not_equal(p, Principal::anonymous())
}

/// Checks if a principal is the anonymous principal.
///
/// # Arguments
/// * `p` - The principal to check.
///
/// # Returns
/// True if the principal is anonymous; false otherwise.
pub fn principal_anonymous(p: Principal) -> bool {
    principal_equal(p, Principal::anonymous())
}

/// Checks if two principals are equal and neither is anonymous.
///
/// # Arguments
/// * `x` - The first principal to compare.
/// * `y` - The second principal to compare.
///
/// # Returns
/// True if the principals are equal and neither is anonymous; false otherwise.
pub fn principal_not_anonymous_and_equal(x: Principal, y: Principal) -> bool {
    principal_not_anonymous(x) && principal_equal(x, y)
}

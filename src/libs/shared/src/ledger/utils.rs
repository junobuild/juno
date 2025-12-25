use ic_ledger_types::{AccountIdentifier, Memo};
use icrc_ledger_types::icrc1::transfer::Memo as IcrcMemo;

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

/// Converts a "legacy" ICP ledger memo to an ICRC ledger memo.
///
/// # Arguments
/// * `memo` - The memo to convert.
///
/// # Returns
/// An ICRC memo containing the memo's value as big-endian bytes.
pub fn convert_memo_to_icrc(memo: &Memo) -> IcrcMemo {
    IcrcMemo::from(memo.0.to_be_bytes().to_vec())
}

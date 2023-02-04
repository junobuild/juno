use candid::Principal;
use ic_ledger_types::AccountIdentifier;

pub fn principal_not_equal(x: Principal, y: Principal) -> bool {
    x != y
}

pub fn principal_equal(x: Principal, y: Principal) -> bool {
    x == y
}

pub fn account_identifier_equal(x: AccountIdentifier, y: AccountIdentifier) -> bool {
    x == y
}

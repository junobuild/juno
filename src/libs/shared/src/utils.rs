use candid::Principal;
use ic_ledger_types::AccountIdentifier;

pub fn principal_not_equal(x: Principal, y: Principal) -> bool {
    x != y
}

pub fn principal_equal(x: Principal, y: Principal) -> bool {
    x == y
}

pub fn principal_not_anonymous(p: Principal) -> bool {
    principal_not_equal(p, Principal::anonymous())
}

pub fn principal_anonymous(p: Principal) -> bool {
    principal_equal(p, Principal::anonymous())
}

pub fn account_identifier_equal(x: AccountIdentifier, y: AccountIdentifier) -> bool {
    x == y
}

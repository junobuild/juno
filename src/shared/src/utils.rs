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

// Source: https://forum.dfinity.org/t/convert-principal-to-vec-29-bytes-length/22468/3
pub fn principal_to_bytes(p: &Principal) -> [u8; 30] {
    let mut bytes: [u8; 30] = [0; 30];
    let p_bytes: &[u8] = p.as_slice();
    bytes[0] = p_bytes.len() as u8;
    bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);
    bytes
}

pub fn bytes_to_principal(bytes: &[u8; 30]) -> Principal {
    Principal::from_slice(&bytes[1..1 + bytes[0] as usize])
}

use candid::{Nat, Principal};
use icrc_ledger_types::icrc1::account::Account;

pub struct TransferFromToConsole {
    pub ledger_id: Principal,
    pub from: Account,
    pub amount: Nat,
    pub transaction_fee: Nat,
}

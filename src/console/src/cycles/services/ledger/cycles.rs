use candid::{CandidType, Deserialize, Nat, Principal};
use ic_cdk::call::Call;
use icrc_ledger_types::icrc1::{account::Account, transfer::Memo};
use junobuild_shared::env::CYCLES_LEDGER;
use junobuild_shared::ic::DecodeCandid;

#[derive(CandidType, Deserialize, Clone)]
struct DepositArgs {
    pub to: Account,
    pub memo: Option<Memo>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct DepositResult {
    pub block_index: Nat,
    pub balance: Nat,
}

pub async fn deposit_cycles(to: Account, cycles: u128) -> Result<DepositResult, String> {
    let ledger_id = Principal::from_text(CYCLES_LEDGER).unwrap();

    let args: DepositArgs = DepositArgs { to, memo: None };

    Call::unbounded_wait(ledger_id, "deposit")
        .with_arg(args)
        .with_cycles(cycles)
        .await
        .decode_candid::<DepositResult>()
}

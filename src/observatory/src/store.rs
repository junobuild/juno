use crate::types::state::{MissionControl, MissionControls, StableState};
use crate::STATE;
use ic_cdk::api::time;
use ic_ledger_types::{AccountIdentifier, Operation};
use shared::ledger::SUB_ACCOUNT;
use shared::types::interface::{MissionControlId, UserId};
use shared::types::ledger::{BlockIndexed, Transaction, Transactions};

/// Mission control centers

pub fn add_mission_control(
    mission_control_id: &MissionControlId,
    owner: &UserId,
) -> MissionControl {
    STATE.with(|state| {
        add_mission_control_impl(mission_control_id, owner, &mut state.borrow_mut().stable)
    })
}

fn add_mission_control_impl(
    mission_control_id: &MissionControlId,
    owner: &UserId,
    state: &mut StableState,
) -> MissionControl {
    let now = time();

    let new_mission_control = MissionControl {
        mission_control_id: *mission_control_id,
        owner: *owner,
        account_identifiers: Vec::from([AccountIdentifier::new(mission_control_id, &SUB_ACCOUNT)]),
        created_at: now,
        updated_at: now,
    };

    state
        .mission_controls
        .insert(*mission_control_id, new_mission_control.clone());

    new_mission_control
}

pub fn get_mission_controls_account_identifiers() -> Vec<AccountIdentifier> {
    STATE.with(|state| {
        get_mission_controls_account_identifiers_impl(&state.borrow().stable.mission_controls)
    })
}

fn get_mission_controls_account_identifiers_impl(
    mission_controls: &MissionControls,
) -> Vec<AccountIdentifier> {
    mission_controls
        .iter()
        .flat_map(|(_, mission_control)| mission_control.account_identifiers.clone())
        .collect()
}

/// Transactions

pub fn get_transactions(account_identifier: &AccountIdentifier) -> Transactions {
    STATE.with(|state| get_transactions_impl(account_identifier, &state.borrow().stable))
}

fn get_transactions_impl(
    account_identifier: &AccountIdentifier,
    state: &StableState,
) -> Transactions {
    state
        .transactions
        .get(account_identifier)
        .unwrap_or(&Vec::new())
        .clone()
}

pub fn insert_transaction(block: &BlockIndexed) {
    STATE.with(|state| insert_transaction_impl(block, &mut state.borrow_mut().stable))
}

fn insert_transaction_impl(block: &BlockIndexed, state: &mut StableState) {
    let transaction = Transaction::from(block);

    match &transaction.operation {
        None => (),
        Some(operation) => match operation {
            Operation::Transfer { from, to, .. } => {
                insert_transaction_block_impl(&transaction, from, state);
                insert_transaction_block_impl(&transaction, to, state);
            }
            Operation::Mint { to, .. } => {
                insert_transaction_block_impl(&transaction, to, state);
            }
            Operation::Burn { from, .. } => {
                insert_transaction_block_impl(&transaction, from, state);
            }
        },
    }
}

fn insert_transaction_block_impl(
    transaction: &Transaction,
    account_identifier: &AccountIdentifier,
    state: &mut StableState,
) {
    let transactions = state.transactions.get(account_identifier);
    let new_transaction = Vec::from([transaction.clone()]);

    match transactions {
        None => {
            state
                .transactions
                .insert(*account_identifier, new_transaction);
        }
        Some(transactions) => {
            let new_transactions: Transactions = transactions
                .iter()
                .cloned()
                .chain(new_transaction.iter().cloned())
                .collect();
            state
                .transactions
                .insert(*account_identifier, new_transactions);
        }
    }
}

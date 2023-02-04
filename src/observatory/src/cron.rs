use crate::store::{get_mission_controls_account_identifiers, insert_transaction};
use crate::STATE;
use ic_cdk::print;
use ic_ledger_types::AccountIdentifier;
use lazy_static::lazy_static;
use shared::ledger::{chain_length, find_blocks_transfer};
use std::cmp::min;
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

pub async fn run_timer() {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        sync_transactions_within_lock().await.unwrap();
    }
}

async fn sync_transactions_within_lock() -> Result<&'static str, &'static str> {
    // ⚠️ There is also no direct call to query the length of the chain only

    // ⚠️ We assume the chain exists and it contains is a first block which we use to query the length of the chain
    let block_chain_length = chain_length(0).await;

    match block_chain_length {
        Err(_) => Err("Chain length cannot be found."),
        Ok(block_chain_length) => {
            let block_index_synced_up_to =
                STATE.with(|state| state.borrow().stable.cron.block_index_synced_up_to);

            if block_index_synced_up_to.is_none() {
                // We only reach here on service initialization and we don't care about previous blocks, so
                // we mark that we are synced with the latest tip_of_chain and return so that subsequent
                // syncs will continue from there
                STATE.with(|state| {
                    let mut cron = &mut state.borrow_mut().stable.cron;
                    cron.block_index_synced_up_to = Some(block_chain_length);
                });

                return Ok("Transactions sync initialized");
            }

            let block_index = block_index_synced_up_to.unwrap();

            // ⚠️ Querying the chain over the last block inter - e.g. querying block index 65 while chain is 64 long - lead to a panic error in the ledger
            if block_chain_length <= block_index {
                return Ok("No new transaction to sync.");
            }

            let blocks_length_to_search_for = min(1000, block_chain_length - block_index);

            let mission_control_account_identifiers: Vec<AccountIdentifier> =
                get_mission_controls_account_identifiers();

            let blocks = find_blocks_transfer(
                block_index,
                blocks_length_to_search_for,
                mission_control_account_identifiers,
            )
            .await;

            for block in &blocks {
                insert_transaction(block);
            }

            let next_block_index_to_sync = block_index + blocks_length_to_search_for;
            STATE.with(|state| {
                state.borrow_mut().stable.cron.block_index_synced_up_to =
                    Some(next_block_index_to_sync)
            });

            print(format!("Transactions synced: {}", &blocks.len()));

            Ok("Transactions synced.")
        }
    }
}

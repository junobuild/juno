use crate::env::LEDGER;
use crate::types::ledger::{BlockIndexed, Blocks};
use crate::utils::account_identifier_equal;
use candid::{Func, Principal};
use futures::future::join_all;
use ic_cdk::api::call::{CallResult, RejectionCode};
use ic_cdk::call;
use ic_ledger_types::{
    query_blocks, transfer, AccountIdentifier, ArchivedBlockRange, BlockIndex, GetBlocksArgs,
    GetBlocksResult, Memo, Operation, Subaccount, Tokens, Transaction, TransferArgs,
    TransferResult, DEFAULT_SUBACCOUNT,
};

// We do not use subaccount, yet.
pub static SUB_ACCOUNT: Subaccount = DEFAULT_SUBACCOUNT;

pub fn principal_to_account_identifier(
    principal: &Principal,
    sub_account: &Subaccount,
) -> AccountIdentifier {
    AccountIdentifier::new(principal, sub_account)
}

pub async fn transfer_payment(
    to: &Principal,
    to_sub_account: &Subaccount,
    memo: Memo,
    amount: Tokens,
    fee: Tokens,
) -> CallResult<TransferResult> {
    let args = TransferArgs {
        memo,
        amount,
        fee,
        from_subaccount: Some(SUB_ACCOUNT),
        to: principal_to_account_identifier(to, to_sub_account),
        created_at_time: None,
    };

    let ledger = Principal::from_text(LEDGER).unwrap();

    transfer(ledger, args).await
}

pub async fn find_payment(
    from: AccountIdentifier,
    to: AccountIdentifier,
    amount: Tokens,
    block_index: BlockIndex,
) -> Option<BlockIndexed> {
    let ledger = Principal::from_text(LEDGER).unwrap();

    // We can use a length of block of 1 to find the block we are interested in
    // https://forum.dfinity.org/t/ledger-query-blocks-how-to/16996/4
    let response = blocks_since(ledger, block_index, 1).await.unwrap();

    fn payment_check(
        transaction: &Transaction,
        expected_from: AccountIdentifier,
        expected_to: AccountIdentifier,
        expected_amount: Tokens,
    ) -> bool {
        match &transaction.operation {
            None => (),
            Some(operation) => match operation {
                Operation::Transfer {
                    from, to, amount, ..
                } => {
                    return account_identifier_equal(expected_from, *from)
                        && account_identifier_equal(expected_to, *to)
                        && expected_amount.e8s() == amount.e8s();
                }
                Operation::Mint { .. } => (),
                Operation::Burn { .. } => (),
                Operation::Approve { .. } => (),
                Operation::TransferFrom { .. } => (),
            },
        }

        false
    }

    let block = response
        .iter()
        .find(|(_, block)| payment_check(&block.transaction, from, to, amount));

    block.cloned()
}

pub async fn chain_length(block_index: BlockIndex) -> CallResult<u64> {
    let ledger = Principal::from_text(LEDGER).unwrap();
    let response = query_blocks(
        ledger,
        GetBlocksArgs {
            start: block_index,
            length: 1,
        },
    )
    .await?;
    Ok(response.chain_length)
}

pub async fn find_blocks_transfer(
    block_index: BlockIndex,
    length: u64,
    account_identifiers: Vec<AccountIdentifier>,
) -> Blocks {
    let ledger = Principal::from_text(LEDGER).unwrap();

    // Source: OpenChat
    // https://github.com/open-ic/transaction-notifier/blob/cf8c2deaaa2e90aac9dc1e39ecc3e67e94451c08/canister/impl/src/lifecycle/heartbeat.rs#L73
    let response = blocks_since(ledger, block_index, length).await.unwrap();

    fn valid_mission_control(
        transaction: &Transaction,
        account_identifiers: &[AccountIdentifier],
    ) -> bool {
        match &transaction.operation {
            None => (),
            Some(operation) => match operation {
                Operation::Transfer { from, to, .. } => {
                    return account_identifiers.iter().any(|&account_identifier| {
                        account_identifier == *to || account_identifier == *from
                    });
                }
                Operation::Mint { .. } => (),
                Operation::Burn { .. } => (),
                Operation::Approve { .. } => (),
                Operation::TransferFrom { .. } => (),
            },
        }

        false
    }

    response
        .into_iter()
        .filter(|(_, block)| valid_mission_control(&block.transaction, &account_identifiers))
        .collect()
}

// Source: OpenChat
// https://github.com/open-ic/transaction-notifier/blob/cf8c2deaaa2e90aac9dc1e39ecc3e67e94451c08/canister/impl/src/lifecycle/heartbeat.rs
async fn blocks_since(
    ledger_canister_id: Principal,
    start: BlockIndex,
    length: u64,
) -> CallResult<Blocks> {
    let response = query_blocks(ledger_canister_id, GetBlocksArgs { start, length }).await?;

    let blocks: Blocks = response
        .blocks
        .into_iter()
        .enumerate()
        .map(|(index, block)| (start + (index as u64), block))
        .collect();

    if response.archived_blocks.is_empty() {
        Ok(blocks)
    } else {
        type FromArchiveResult = CallResult<Blocks>;

        async fn get_blocks_from_archive(range: ArchivedBlockRange) -> FromArchiveResult {
            let args = GetBlocksArgs {
                start: range.start,
                length: range.length,
            };
            let func: Func = range.callback.into();

            let response: CallResult<(GetBlocksResult,)> =
                call(func.principal, &func.method, (args,)).await;

            match response {
                Err(e) => Err(e),
                Ok((block_result,)) => match block_result {
                    Err(_) => Err((
                        RejectionCode::Unknown,
                        "Block results cannot be decoded".to_string(),
                    )),
                    Ok(blocks_range) => Ok(blocks_range
                        .blocks
                        .into_iter()
                        .enumerate()
                        .map(|(index, block)| (range.start + (index as u64), block))
                        .collect()),
                },
            }
        }

        // Adapt original code .archived_blocks.into_iter().sorted_by_key(|a| a.start)
        let mut order_archived_blocks = response.archived_blocks;
        order_archived_blocks.sort_by(|a, b| a.start.cmp(&b.start));

        // Get the transactions from the archive canisters
        let futures: Vec<_> = order_archived_blocks
            .into_iter()
            .map(get_blocks_from_archive)
            .collect();

        let archive_responses: Vec<FromArchiveResult> = join_all(futures).await;

        let results = archive_responses
            .into_iter()
            .collect::<CallResult<Vec<Blocks>>>()?;

        Ok(results.into_iter().flatten().chain(blocks).collect())
    }
}

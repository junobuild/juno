use crate::env::LEDGER;
use crate::ledger::types::icp::{BlockIndexed, Blocks};
use crate::ledger::utils::account_identifier_equal;
use candid::{Func, Principal};
use futures::future::join_all;
use ic_cdk::api::call::{
    CallResult as DeprecatedCallResult, RejectionCode as DeprecatedRejectionCode,
};
use ic_cdk::call;
use ic_cdk::call::{CallResult, Error};
use ic_ledger_types::{
    query_blocks, transfer, AccountIdentifier, ArchivedBlockRange, BlockIndex, GetBlocksArgs,
    GetBlocksResult, Memo, Operation, Subaccount, Tokens, Transaction, TransferArgs,
    TransferResult, DEFAULT_SUBACCOUNT,
};

// We do not use subaccount, yet.
pub const SUB_ACCOUNT: Subaccount = DEFAULT_SUBACCOUNT;

/// Converts a principal and subaccount into an account identifier.
///
/// # Arguments
/// * `principal` - A reference to the principal to be converted.
/// * `sub_account` - A reference to the subaccount.
///
/// # Returns
/// An `AccountIdentifier` derived from the given principal and subaccount.
pub fn principal_to_account_identifier(
    principal: &Principal,
    sub_account: &Subaccount,
) -> AccountIdentifier {
    AccountIdentifier::new(principal, sub_account)
}

/// Transfers tokens to a specified account.
///
/// # Arguments
/// * `to` - The principal of the destination account.
/// * `to_sub_account` - The subaccount of the destination account.
/// * `memo` - A memo for the transaction.
/// * `amount` - The amount of tokens to transfer.
/// * `fee` - The transaction fee.
///
/// # Returns
/// A result containing the transfer result or an error message.
pub async fn transfer_payment(
    to: &Principal,
    to_sub_account: &Subaccount,
    memo: Memo,
    amount: Tokens,
    fee: Tokens,
) -> CallResult<TransferResult> {
    let account_identifier: AccountIdentifier = principal_to_account_identifier(to, to_sub_account);

    let args = TransferArgs {
        memo,
        amount,
        fee,
        from_subaccount: Some(SUB_ACCOUNT),
        to: account_identifier,
        created_at_time: None,
    };

    transfer_token(args).await
}

/// Initiates a transfer of ICP tokens using the provided arguments and "old" ICP account identifier.
///
/// # Arguments
/// * `args` - A `TransferArgs` struct containing the details of the ICP transfer.
///
/// # Returns
/// A `CallResult<TransferResult>` indicating either the success or failure of the ICP token transfer.
pub async fn transfer_token(args: TransferArgs) -> CallResult<TransferResult> {
    let ledger = Principal::from_text(LEDGER).unwrap();

    transfer(ledger, &args).await
}

/// Finds a payment transaction based on specified criteria.
///
/// # Arguments
/// * `from` - The account identifier of the sender.
/// * `to` - The account identifier of the receiver.
/// * `amount` - The amount of tokens transferred.
/// * `block_index` - The starting block index to search from.
///
/// # Returns
/// An option containing the found block indexed or None if not found.
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

/// Queries the ledger for the current chain length.
///
/// # Arguments
/// * `block_index` - The block index from which to start the query.
///
/// # Returns
/// A result containing the chain length or an error message.
pub async fn chain_length(block_index: BlockIndex) -> CallResult<u64> {
    let ledger = Principal::from_text(LEDGER).unwrap();
    let response = query_blocks(
        ledger,
        &GetBlocksArgs {
            start: block_index,
            length: 1,
        },
    )
    .await?;
    Ok(response.chain_length)
}

/// Finds blocks containing transfers for specified account identifiers.
///
/// # Arguments
/// * `block_index` - The starting block index for the query.
/// * `length` - The number of blocks to query.
/// * `account_identifiers` - A list of account identifiers to match transactions.
///
/// # Returns
/// A collection of blocks matching the criteria.
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

/// Queries the ledger for blocks since a specified index, including handling archived blocks.
///
/// # Arguments
/// * `ledger_canister_id` - The principal of the ledger canister.
/// * `start` - The starting block index.
/// * `length` - The number of blocks to query.
///
/// # Returns
/// A result containing the queried blocks or an error message.
async fn blocks_since(
    ledger_canister_id: Principal,
    start: BlockIndex,
    length: u64,
) -> DeprecatedCallResult<Blocks> {
    // Source: OpenChat
    // https://github.com/open-ic/transaction-notifier/blob/cf8c2deaaa2e90aac9dc1e39ecc3e67e94451c08/canister/impl/src/lifecycle/heartbeat.rs

    let response = query_blocks(ledger_canister_id, &GetBlocksArgs { start, length })
        .await
        .map_err(|err: Error| (DeprecatedRejectionCode::CanisterReject, err.to_string()))?;

    let blocks: Blocks = response
        .blocks
        .into_iter()
        .enumerate()
        .map(|(index, block)| (start + (index as u64), block))
        .collect();

    if response.archived_blocks.is_empty() {
        Ok(blocks)
    } else {
        type FromArchiveResult = DeprecatedCallResult<Blocks>;

        async fn get_blocks_from_archive(range: ArchivedBlockRange) -> FromArchiveResult {
            let args = GetBlocksArgs {
                start: range.start,
                length: range.length,
            };
            let func: Func = range.callback.into();

            let response: DeprecatedCallResult<(GetBlocksResult,)> =
                call(func.principal, &func.method, (args,)).await;

            match response {
                Err(e) => Err(e),
                Ok((block_result,)) => match block_result {
                    Err(_) => Err((
                        DeprecatedRejectionCode::Unknown,
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
            .collect::<DeprecatedCallResult<Vec<Blocks>>>()?;

        Ok(results.into_iter().flatten().chain(blocks).collect())
    }
}

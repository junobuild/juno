// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const AccountIdentifier = IDL.Vec(IDL.Nat8);
	const AccountBalanceArgs = IDL.Record({ account: AccountIdentifier });
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const Archive = IDL.Record({ canister_id: IDL.Principal });
	const Archives = IDL.Record({ archives: IDL.Vec(Archive) });
	const BlockIndex = IDL.Nat64;
	const GetBlocksArgs = IDL.Record({
		start: BlockIndex,
		length: IDL.Nat64
	});
	const Memo = IDL.Nat64;
	const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
	const Operation = IDL.Variant({
		Approve: IDL.Record({
			fee: Tokens,
			from: AccountIdentifier,
			allowance_e8s: IDL.Int,
			expires_at: IDL.Opt(TimeStamp),
			spender: AccountIdentifier
		}),
		Burn: IDL.Record({ from: AccountIdentifier, amount: Tokens }),
		Mint: IDL.Record({ to: AccountIdentifier, amount: Tokens }),
		Transfer: IDL.Record({
			to: AccountIdentifier,
			fee: Tokens,
			from: AccountIdentifier,
			amount: Tokens
		}),
		TransferFrom: IDL.Record({
			to: AccountIdentifier,
			fee: Tokens,
			from: AccountIdentifier,
			amount: Tokens,
			spender: AccountIdentifier
		})
	});
	const Transaction = IDL.Record({
		memo: Memo,
		icrc1_memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
		operation: IDL.Opt(Operation),
		created_at_time: TimeStamp
	});
	const Block = IDL.Record({
		transaction: Transaction,
		timestamp: TimeStamp,
		parent_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	const BlockRange = IDL.Record({ blocks: IDL.Vec(Block) });
	const QueryArchiveError = IDL.Variant({
		BadFirstBlockIndex: IDL.Record({
			requested_index: BlockIndex,
			first_valid_index: BlockIndex
		}),
		Other: IDL.Record({
			error_message: IDL.Text,
			error_code: IDL.Nat64
		})
	});
	const QueryArchiveResult = IDL.Variant({
		Ok: BlockRange,
		Err: QueryArchiveError
	});
	const QueryArchiveFn = IDL.Func([GetBlocksArgs], [QueryArchiveResult], ['query']);
	const QueryBlocksResponse = IDL.Record({
		certificate: IDL.Opt(IDL.Vec(IDL.Nat8)),
		blocks: IDL.Vec(Block),
		chain_length: IDL.Nat64,
		first_block_index: BlockIndex,
		archived_blocks: IDL.Vec(
			IDL.Record({
				callback: QueryArchiveFn,
				start: BlockIndex,
				length: IDL.Nat64
			})
		)
	});
	const SubAccount = IDL.Vec(IDL.Nat8);
	const TransferArgs = IDL.Record({
		to: AccountIdentifier,
		fee: Tokens,
		memo: Memo,
		from_subaccount: IDL.Opt(SubAccount),
		created_at_time: IDL.Opt(TimeStamp),
		amount: Tokens
	});
	const TransferError = IDL.Variant({
		TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
		BadFee: IDL.Record({ expected_fee: Tokens }),
		TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
		TxCreatedInFuture: IDL.Null,
		InsufficientFunds: IDL.Record({ balance: Tokens })
	});
	const TransferResult = IDL.Variant({
		Ok: BlockIndex,
		Err: TransferError
	});
	const TransferFeeArg = IDL.Record({});
	const TransferFee = IDL.Record({ transfer_fee: Tokens });
	return IDL.Service({
		account_balance: IDL.Func([AccountBalanceArgs], [Tokens], ['query']),
		archives: IDL.Func([], [Archives], ['query']),
		decimals: IDL.Func([], [IDL.Record({ decimals: IDL.Nat32 })], ['query']),
		name: IDL.Func([], [IDL.Record({ name: IDL.Text })], ['query']),
		query_blocks: IDL.Func([GetBlocksArgs], [QueryBlocksResponse], ['query']),
		symbol: IDL.Func([], [IDL.Record({ symbol: IDL.Text })], ['query']),
		transfer: IDL.Func([TransferArgs], [TransferResult], []),
		transfer_fee: IDL.Func([TransferFeeArg], [TransferFee], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

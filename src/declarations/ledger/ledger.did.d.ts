import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface AccountBalanceArgs {
	account: AccountIdentifier;
}
export type AccountIdentifier = Uint8Array | number[];
export interface Archive {
	canister_id: Principal;
}
export interface Archives {
	archives: Array<Archive>;
}
export interface Block {
	transaction: Transaction;
	timestamp: TimeStamp;
	parent_hash: [] | [Uint8Array | number[]];
}
export type BlockIndex = bigint;
export interface BlockRange {
	blocks: Array<Block>;
}
export interface GetBlocksArgs {
	start: BlockIndex;
	length: bigint;
}
export type Memo = bigint;
export type Operation =
	| {
			Approve: {
				fee: Tokens;
				from: AccountIdentifier;
				allowance_e8s: bigint;
				expires_at: [] | [TimeStamp];
				spender: AccountIdentifier;
			};
	  }
	| { Burn: { from: AccountIdentifier; amount: Tokens } }
	| { Mint: { to: AccountIdentifier; amount: Tokens } }
	| {
			Transfer: {
				to: AccountIdentifier;
				fee: Tokens;
				from: AccountIdentifier;
				amount: Tokens;
			};
	  }
	| {
			TransferFrom: {
				to: AccountIdentifier;
				fee: Tokens;
				from: AccountIdentifier;
				amount: Tokens;
				spender: AccountIdentifier;
			};
	  };
export type QueryArchiveError =
	| {
			BadFirstBlockIndex: {
				requested_index: BlockIndex;
				first_valid_index: BlockIndex;
			};
	  }
	| { Other: { error_message: string; error_code: bigint } };
export type QueryArchiveFn = ActorMethod<[GetBlocksArgs], QueryArchiveResult>;
export type QueryArchiveResult = { Ok: BlockRange } | { Err: QueryArchiveError };
export interface QueryBlocksResponse {
	certificate: [] | [Uint8Array | number[]];
	blocks: Array<Block>;
	chain_length: bigint;
	first_block_index: BlockIndex;
	archived_blocks: Array<{ callback: QueryArchiveFn; start: BlockIndex; length: bigint }>;
}
export type SubAccount = Uint8Array | number[];
export interface TimeStamp {
	timestamp_nanos: bigint;
}
export interface Tokens {
	e8s: bigint;
}
export interface Transaction {
	memo: Memo;
	icrc1_memo: [] | [Uint8Array | number[]];
	operation: [] | [Operation];
	created_at_time: TimeStamp;
}
export interface TransferArgs {
	to: AccountIdentifier;
	fee: Tokens;
	memo: Memo;
	from_subaccount: [] | [SubAccount];
	created_at_time: [] | [TimeStamp];
	amount: Tokens;
}
export type TransferError =
	| {
			TxTooOld: { allowed_window_nanos: bigint };
	  }
	| { BadFee: { expected_fee: Tokens } }
	| { TxDuplicate: { duplicate_of: BlockIndex } }
	| { TxCreatedInFuture: null }
	| { InsufficientFunds: { balance: Tokens } };
export interface TransferFee {
	transfer_fee: Tokens;
}
export type TransferFeeArg = {};
export type TransferResult = { Ok: BlockIndex } | { Err: TransferError };
export interface _SERVICE {
	account_balance: ActorMethod<[AccountBalanceArgs], Tokens>;
	archives: ActorMethod<[], Archives>;
	decimals: ActorMethod<[], { decimals: number }>;
	name: ActorMethod<[], { name: string }>;
	query_blocks: ActorMethod<[GetBlocksArgs], QueryBlocksResponse>;
	symbol: ActorMethod<[], { symbol: string }>;
	transfer: ActorMethod<[TransferArgs], TransferResult>;
	transfer_fee: ActorMethod<[TransferFeeArg], TransferFee>;
}

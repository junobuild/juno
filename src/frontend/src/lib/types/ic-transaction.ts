export type IcTransactionType = 'send' | 'receive' | 'approve' | 'burn' | 'mint';

export type IcTransactionStatus = 'executed' | 'pending' | 'reimbursed' | 'failed';

export interface IcTransactionUi {
	id: bigint;
	type: IcTransactionType;
	// e.g. BTC Received
	typeLabel?: string;
	from?: string;
	// e.g. From: BTC Network
	fromLabel?: string;
	fromExplorerUrl?: string;
	to?: string;
	// e.g. To: BTC Network
	toLabel?: string;
	toExplorerUrl?: string;
	incoming?: boolean;
	value?: bigint;
	timestamp?: bigint;
	status: IcTransactionStatus;
	txExplorerUrl?: string;
	memo: bigint;
}

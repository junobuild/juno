import { getAccountIdentifier } from '$lib/api/icp-index.api';
import type {
	IcpTransaction,
	IcTransactionAddOnsInfo,
	IcTransactionUi
} from '$lib/types/ic-transaction';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Tokens, Transaction, TransactionWithId } from '@dfinity/ledger-icp';
import { fromNullable, jsonReplacer, nonNullish } from '@dfinity/utils';

export const mapTransactionIcpToSelf = (
	tx: TransactionWithId
): ({ transaction: Transaction & IcTransactionAddOnsInfo } & Pick<TransactionWithId, 'id'>)[] => {
	const { transaction, id } = tx;
	const { operation } = transaction;

	if (!('Transfer' in operation)) {
		return [
			{
				id,
				transaction
			}
		];
	}

	const {
		Transfer: { from, to }
	} = operation;

	return [
		{
			id,
			transaction: {
				...transaction,
				transferToSelf: 'send'
			}
		},
		...(from.toLowerCase() === to.toLowerCase()
			? [
					{
						id,
						transaction: {
							...transaction,
							transferToSelf: 'receive' as const
						}
					}
				]
			: [])
	];
};

export const mapIcpTransaction = ({
	transaction: { transaction, id },
	identity
}: {
	transaction: IcpTransaction;
	identity: OptionIdentity;
}): IcTransactionUi => {
	const { operation, timestamp, memo, transferToSelf } = transaction;

	const ICP_EXPLORER_URL = import.meta.env.VITE_ICP_EXPLORER_URL;

	const tx: Pick<IcTransactionUi, 'timestamp' | 'id' | 'status' | 'txExplorerUrl' | 'memo'> = {
		id,
		timestamp: fromNullable(timestamp)?.timestamp_nanos,
		status: 'executed',
		txExplorerUrl: `${ICP_EXPLORER_URL}/transaction/${id}`,
		memo
	};

	const accountIdentifier = nonNullish(identity)
		? getAccountIdentifier(identity.getPrincipal())
		: undefined;

	const mapFrom = (
		from: string
	): Pick<IcTransactionUi, 'from' | 'fromExplorerUrl' | 'incoming'> => ({
		from,
		fromExplorerUrl: `${ICP_EXPLORER_URL}/account/${from}`,
		incoming:
			from?.toLowerCase() !== accountIdentifier?.toHex().toLowerCase() ||
			transferToSelf === 'receive'
	});

	const mapTo = (to: string): Pick<IcTransactionUi, 'to' | 'toExplorerUrl'> => ({
		to,
		toExplorerUrl: `${ICP_EXPLORER_URL}/account/${to}`
	});

	const mapAmount = ({
		amount,
		fee,
		incoming
	}: {
		incoming: boolean | undefined;
		fee: Tokens;
		amount: Tokens;
	}): bigint => amount.e8s + (incoming === false ? fee.e8s : 0n);

	if ('Approve' in operation) {
		return {
			...tx,
			type: 'approve',
			...mapFrom(operation.Approve.from)
		};
	}

	if ('Burn' in operation) {
		return {
			...tx,
			type: 'burn',
			...mapFrom(operation.Burn.from),
			value: operation.Burn.amount.e8s
		};
	}

	if ('Mint' in operation) {
		return {
			...tx,
			type: 'mint',
			...mapTo(operation.Mint.to),
			incoming: true,
			value: operation.Mint.amount.e8s
		};
	}

	if ('Transfer' in operation) {
		const source = mapFrom(operation.Transfer.from);

		return {
			...tx,
			type: source.incoming === false ? 'send' : 'receive',
			...source,
			...mapTo(operation.Transfer.to),
			value: mapAmount({
				amount: operation.Transfer.amount,
				fee: operation.Transfer.fee,
				incoming: source.incoming
			})
		};
	}

	throw new Error(`Unknown transaction type ${JSON.stringify(transaction, jsonReplacer)}`);
};

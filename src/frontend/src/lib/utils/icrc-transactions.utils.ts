import type { IcrcAccountText } from '$lib/schemas/wallet.schema';
import type { IcTransactionType, IcTransactionUi } from '$lib/types/ic-transaction';
import {
	assertNonNullish,
	fromNullable,
	fromNullishNullable,
	jsonReplacer,
	nonNullish,
	uint8ArrayToBigInt
} from '@dfinity/utils';
import {
	encodeIcrcAccount,
	fromCandidAccount,
	type IcrcIndexDid
} from '@icp-sdk/canisters/ledger/icrc';

export const mapIcrcTransaction = ({
	transaction: { transaction, id },
	icrcAccountText
}: {
	transaction: IcrcIndexDid.TransactionWithId;
	icrcAccountText: IcrcAccountText;
}): IcTransactionUi => {
	const { timestamp, approve, burn, mint, transfer } = transaction;

	const data =
		fromNullable(approve) ?? fromNullable(burn) ?? fromNullable(mint) ?? fromNullable(transfer);

	assertNonNullish(data, `Unknown transaction type ${JSON.stringify(transaction, jsonReplacer)}`);

	const mapFrom = (from: string): Pick<IcTransactionUi, 'from' | 'incoming'> => ({
		from,
		incoming: from?.toLowerCase() !== icrcAccountText?.toLowerCase()
	});

	const isApprove = nonNullish(fromNullable(approve));
	const isMint = nonNullish(fromNullable(mint));

	const source: Pick<IcTransactionUi, 'from' | 'incoming'> = {
		...('from' in data
			? mapFrom(encodeIcrcAccount(fromCandidAccount(data.from)))
			: isMint
				? { incoming: true }
				: {})
	};

	const type: IcTransactionType = nonNullish(fromNullable(approve))
		? 'approve'
		: nonNullish(fromNullable(burn))
			? 'burn'
			: isMint
				? 'mint'
				: source.incoming === false
					? 'send'
					: 'receive';

	const approveFee = fromNullishNullable(fromNullable(approve)?.fee);
	const transferFee = fromNullishNullable(fromNullable(transfer)?.fee);

	const value = data?.amount;
	const fee = isApprove ? approveFee : transferFee;

	const mapMemo = (): Pick<IcTransactionUi, 'memo'> => {
		const icrc1Memo = fromNullable(data?.memo);

		if (nonNullish(icrc1Memo)) {
			return { memo: uint8ArrayToBigInt(icrc1Memo) };
		}

		return { memo: 0n };
	};

	const memo = mapMemo();

	const approveData = fromNullable(approve);
	const approveSpender = nonNullish(approveData)
		? encodeIcrcAccount(fromCandidAccount(approveData.spender))
		: undefined;

	const approveExpiresAt = fromNullishNullable(approveData?.expires_at);

	const ICP_EXPLORER_URL = import.meta.env.VITE_ICP_EXPLORER_URL;

	return {
		id,
		type,
		...source,
		to: 'to' in data ? encodeIcrcAccount(fromCandidAccount(data.to)) : undefined,
		...(nonNullish(value) && { value }),
		...(nonNullish(fee) && { fee }),
		timestamp,
		status: 'executed',
		...(nonNullish(approveSpender) && { approveSpender }),
		...(nonNullish(approveSpender) && {
			approveSpenderExplorerUrl: `${ICP_EXPLORER_URL}/account/${approveSpender}`
		}),
		...(nonNullish(approveExpiresAt) && { approveExpiresAt }),
		...memo
	};
};

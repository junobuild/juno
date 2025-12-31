import { CyclesToken } from '$lib/constants/token.constants';
import type { SelectedToken } from '$lib/schemas/wallet.schema';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { formatTCycles } from '$lib/utils/cycles.utils';
import { formatICP } from '$lib/utils/icp.utils';
import {
	FromStringToTokenError,
	ICPToken,
	isNullish,
	TokenAmountV2,
	type Token
} from '@dfinity/utils';
import { get } from 'svelte/store';

export const amountToToken = ({
	amount,
	token
}: {
	amount: string | undefined;
	token: Token;
}): TokenAmountV2 | undefined => {
	// For convenience reason the function accept undefined
	if (isNullish(amount)) {
		return undefined;
	}

	const tokenAmount = TokenAmountV2.fromString({ token, amount });

	if (
		Object.values(FromStringToTokenError).includes(tokenAmount as string | FromStringToTokenError)
	) {
		return undefined;
	}

	return <TokenAmountV2>tokenAmount;
};

export const assertAndConvertAmountToToken = ({
	amount,
	balance,
	token,
	fee
}: {
	amount: string | undefined;
	balance: bigint | undefined;
	token: Token;
	fee: bigint;
}): { valid: boolean; tokenAmount?: TokenAmountV2 } => {
	const labels = get(i18n);

	if (isNullish(balance) || balance === 0n) {
		toasts.error({
			text: labels.errors.empty_balance
		});
		return { valid: false };
	}

	if (isNullish(amount)) {
		toasts.error({
			text: labels.errors.empty_amount
		});
		return { valid: false };
	}

	const tokenAmount = amountToToken({ amount, token });

	if (isNullish(tokenAmount)) {
		toasts.error({
			text: labels.errors.invalid_amount
		});
		return { valid: false };
	}

	if (balance - fee < tokenAmount.toUlps()) {
		toasts.error({
			text: labels.errors.invalid_amount
		});
		return { valid: false };
	}

	return { valid: true, tokenAmount };
};

export const isTokenIcp = ({ token: { symbol } }: SelectedToken): boolean =>
	symbol === ICPToken.symbol;

export const isTokenCycles = ({ token: { symbol } }: SelectedToken): boolean =>
	symbol === CyclesToken.symbol;

export const formatToken = ({
	selectedToken,
	amount,
	withSymbol = false
}: {
	selectedToken: SelectedToken;
	amount: bigint;
	withSymbol?: boolean;
}): string => {
	const icp = isTokenIcp(selectedToken);
	const formattedAmount = icp ? formatICP(amount) : formatTCycles(amount);
	return `${formattedAmount}${withSymbol ? ` ${icp ? 'ICP' : 'T Cycles'}` : ''}`;
};

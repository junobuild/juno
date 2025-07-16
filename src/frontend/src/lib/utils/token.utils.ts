import { IC_TRANSACTION_FEE_ICP } from '$lib/constants/app.constants';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { FromStringToTokenError, ICPToken, isNullish, TokenAmountV2 } from '@dfinity/utils';
import { get } from 'svelte/store';

export const amountToICPToken = (amount: string | undefined): TokenAmountV2 | undefined => {
	// For convenience reason the function accept undefined
	if (isNullish(amount)) {
		return undefined;
	}

	const token = TokenAmountV2.fromString({ token: ICPToken, amount });

	if (Object.values(FromStringToTokenError).includes(token as string | FromStringToTokenError)) {
		return undefined;
	}

	return <TokenAmountV2>token;
};

export const assertAndConvertAmountToICPToken = ({
	amount,
	balance,
	fee = IC_TRANSACTION_FEE_ICP
}: {
	amount: string | undefined;
	balance: bigint | undefined;
	fee?: bigint;
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

	const tokenAmount = amountToICPToken(amount);

	if (isNullish(tokenAmount)) {
		toasts.error({
			text: labels.errors.invalid_amount
		});
		return { valid: false };
	}

	if (balance - fee < tokenAmount.toE8s()) {
		toasts.error({
			text: labels.errors.invalid_amount
		});
		return { valid: false };
	}

	return { valid: true, tokenAmount };
};

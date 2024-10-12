import { FromStringToTokenError, ICPToken, isNullish, TokenAmountV2 } from '@dfinity/utils';

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

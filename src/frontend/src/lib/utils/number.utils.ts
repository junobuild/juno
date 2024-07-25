export const formatNumber = (
	value: number,
	options?: { minFraction?: number; maxFraction?: number } & Pick<
		Intl.NumberFormatOptions,
		'notation'
	>
): string => {
	const { minFraction = 2, maxFraction = 2, notation } = options || {};

	return new Intl.NumberFormat('en-US', {
		notation,
		minimumFractionDigits: minFraction,
		maximumFractionDigits: maxFraction
	}).format(value);
};

export const bigintStringify = (_key: string, value: unknown): unknown =>
	typeof value === 'bigint' ? `BIGINT::${value}` : value;

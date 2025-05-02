// eslint-disable-next-line local-rules/prefer-object-params
export const formatNumber = (
	value: number,
	options?: { minFraction?: number; maxFraction?: number } & Pick<
		Intl.NumberFormatOptions,
		'notation' | 'unit' | 'style' | 'unitDisplay'
	>
): string => {
	const { minFraction = 2, maxFraction = 2, ...rest } = options ?? {};

	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: minFraction,
		maximumFractionDigits: maxFraction,
		...rest
	}).format(value);
};

export const formatCompactNumber = (value: number): string =>
	formatNumber(value, { notation: 'compact', minFraction: 0, maxFraction: 1 });

export const formatUsd = (value: number): string =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'narrowSymbol'
	}).format(value);

export const formatBytes = (value: number): string =>
	formatNumber(value, {
		notation: 'compact',
		style: 'unit',
		unit: 'byte',
		unitDisplay: 'narrow'
	}).replace('BB', 'GB');

// eslint-disable-next-line local-rules/prefer-object-params
export const bigintStringify = (_key: string, value: unknown): unknown =>
	typeof value === 'bigint' ? `BIGINT::${value}` : value;

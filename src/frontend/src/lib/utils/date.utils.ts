export const formatToDate = (nanoseconds: bigint): string => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	};

	const date = new Date(Number(nanoseconds / 1_000_000n));
	return date.toLocaleDateString('en', options);
};

export const toBigIntNanoSeconds = (date: Date): bigint => BigInt(date.getTime()) * BigInt(1e6);

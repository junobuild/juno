export const formatToDate = (milliseconds: bigint): string => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	};

	const date = new Date(Number(milliseconds / 1_000_000n));
	return date.toLocaleDateString('en', options);
};

import { formatDistanceToNow } from 'date-fns';

export const nowInBigIntNanoSeconds = (): bigint => BigInt(Date.now()) * BigInt(1e6);

export const formatToDate = (nanoseconds: bigint): string => {
	const date = new Date(Number(nanoseconds / 1_000_000n));
	return formatDateToDateString(date);
};

export const formatDateToDateString = (date: Date): string => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	};

	return date.toLocaleDateString('en', options);
};

export const formatToDateNumeric = (nanoseconds: bigint): string => {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	};

	const date = new Date(Number(nanoseconds / 1_000_000n));
	return date.toLocaleDateString('en', options);
};

export const formatToDay = (date: Date): string => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric'
	};

	return date.toLocaleDateString('en', options);
};

export const formatToRelativeTime = (nanoseconds: bigint): string => {
	const date = new Date(Number(nanoseconds / 1_000_000n));
	return formatDistanceToNow(date, { addSuffix: true, includeSeconds: false });
};

export const toBigIntNanoSeconds = (date: Date): bigint => BigInt(date.getTime()) * BigInt(1e6);

export const fromBigIntNanoSeconds = (nanoseconds: bigint): Date =>
	new Date(Number(nanoseconds / 1_000_000n));

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_NON_LEAP_YEAR = 365;

export const secondsToDuration = (seconds: bigint): string => {
	let minutes = seconds / BigInt(SECONDS_IN_MINUTE);

	let hours = minutes / BigInt(MINUTES_IN_HOUR);
	minutes -= hours * BigInt(MINUTES_IN_HOUR);

	let days = hours / BigInt(HOURS_IN_DAY);
	hours -= days * BigInt(HOURS_IN_DAY);

	const years = fullYearsInDays(days);
	days -= daysInYears(years);

	const time: Record<string, string> = {
		year: 'year',
		year_plural: 'years',
		month: 'month',
		month_plural: 'months',
		day: 'day',
		day_plural: 'days',
		hour: 'hour',
		hour_plural: 'hours',
		minute: 'minute',
		minute_plural: 'minutes',
		second: 'second',
		second_plural: 'seconds'
	};

	const periods = [
		createLabel('year', years),
		createLabel('day', days),
		createLabel('hour', hours),
		createLabel('minute', minutes),
		...(seconds > BigInt(0) && seconds < BigInt(60) ? [createLabel('second', seconds)] : [])
	];

	return periods
		.filter(({ amount }) => amount > 0)
		.slice(0, 2)
		.map(
			(labelInfo) =>
				`${labelInfo.amount} ${
					labelInfo.amount === 1 ? time[labelInfo.labelKey] : time[`${labelInfo.labelKey}_plural`]
				}`
		)
		.join(', ');
};

const fullYearsInDays = (days: bigint): bigint => {
	// Use integer division.
	let years = days / BigInt(DAYS_IN_NON_LEAP_YEAR);
	while (daysInYears(years) > days) {
		years--;
	}
	return years;
};

const daysInYears = (years: bigint): bigint => {
	// Use integer division.
	const leapDays = years / BigInt(4);
	return years * BigInt(DAYS_IN_NON_LEAP_YEAR) + leapDays;
};

type LabelKey = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
interface LabelInfo {
	labelKey: LabelKey;
	amount: number;
}

// eslint-disable-next-line local-rules/prefer-object-params
const createLabel = (labelKey: LabelKey, amount: bigint): LabelInfo => ({
	labelKey,
	amount: Number(amount)
});

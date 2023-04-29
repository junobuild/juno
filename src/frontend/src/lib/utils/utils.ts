/** Is null or undefined */
export const isNullish = <T>(argument: T | undefined | null): argument is undefined | null =>
	argument === null || argument === undefined;

/** Not null and not undefined */
export const nonNullish = <T>(argument: T | undefined | null): argument is NonNullable<T> =>
	!isNullish(argument);

export class NullishError extends Error {}

export const assertNonNullish: <T>(
	value: T,
	message?: string
) => asserts value is NonNullable<T> = <T>(value: T, message?: string): void => {
	if (isNullish(value)) {
		throw new NullishError(message);
	}
};

export const last = <T>(elements: T[]): T | undefined => {
	const { length, [length - 1]: last } = elements;
	return last;
};

export const keyOf = <T>({ obj, key }: { obj: T; key: string | keyof T }): T[keyof T] =>
	obj[key as keyof T];

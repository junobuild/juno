export const first = <T>(elements: T[]): T | undefined => {
	const [first] = elements;
	return first;
};

export const last = <T>(elements: T[]): T | undefined => {
	const { length, [length - 1]: last } = elements;
	return last;
};

export const keyOf = <T>({ obj, key }: { obj: T; key: string | keyof T }): T[keyof T] =>
	obj[key as keyof T];

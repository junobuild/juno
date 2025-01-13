import { fromNullable } from '@dfinity/utils';

export const fromNullishNullable = <T>(value: ([] | [T]) | undefined): T | undefined =>
	fromNullable(value ?? []);

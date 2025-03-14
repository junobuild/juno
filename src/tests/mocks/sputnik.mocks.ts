import { Principal } from '@dfinity/principal';

export const mockObj = {
	id: 546n,
	owner: Principal.anonymous(),
	array: Uint8Array.from([1, 2, 3]),
	value: 'hello'
};

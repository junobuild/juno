import { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { z } from 'zod';

const SputnikMockSchema = z.object({
	id: z.bigint(),
	owner: z.custom((value: unknown) => {
		if (isNullish(value)) {
			return false;
		}

		return value instanceof Principal;
	}),
	array: z.custom<Uint8Array>((val) => val instanceof Uint8Array),
	value: z.string()
});

export type SputnikMock = z.infer<typeof SputnikMockSchema>;

export const mockSputnikObj: SputnikMock = {
	id: 546n,
	owner: Principal.anonymous(),
	array: Uint8Array.from([1, 2, 3]),
	value: 'hello'
};

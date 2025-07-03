import { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { z } from 'zod/v4';

export const mockSputnikVersion = '1.2.3-patch.4';
export const mockSputnikVersionCollection = 'test_version';
export const mockSputnikVersionKey = 'sputnik-key';

export const SputnikValueMockSchema = z
	.object({
		value: z.string()
	})
	.strict();

export type SputnikValueMock = z.infer<typeof SputnikValueMockSchema>;

export const SputnikMockSchema = z
	.object({
		id: z.bigint(),
		owner: z.custom((value: unknown) => {
			if (isNullish(value)) {
				return false;
			}

			return value instanceof Principal;
		}),
		array: z.custom<Uint8Array>((val) => val instanceof Uint8Array),
		value: z.string()
	})
	.strict();

export type SputnikMock = z.infer<typeof SputnikMockSchema>;

export const mockSputnikObj: SputnikMock = {
	id: 546n,
	owner: Principal.anonymous(),
	array: Uint8Array.from([1, 2, 3]),
	value: 'hello'
};

export interface SputnikTestListDocs {
	items_length: bigint;
	items_page: bigint | undefined;
	matches_length: bigint;
	matches_pages?: bigint;
}

export interface SputnikTestTextEncodingData {
	input: {
		decode: {
			value: Uint8Array;
		};
		encode: {
			value: string;
		};
	};
	output?: {
		decoded: {
			value: string;
			labelNotSupported: boolean;
			inputIsNotArrayBuffer: boolean;
		};
		encoded: {
			value: Uint8Array;
			encodeIntoNotSupported: boolean;
		};
	};
}

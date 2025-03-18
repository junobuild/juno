import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { type SputnikTestTextEncodingData } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { setDocAndAssertLogsLength } from '../../utils/sputnik-tests.utils';

describe('Sputnik > text-encoding', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-textencoding';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setAndAssert = async ({ collection, length }: { collection: string; length: number }) => {
		await setDocAndAssertLogsLength({
			collection,
			length,
			actor,
			controller,
			canisterId,
			pic
		});
	};

	it('should encode and decode using text encoding polyfill', async () => {
		const { set_doc, get_doc } = actor;

		const key = nanoid();

		const mockString = 'Hello, world!';

		const encoder = new TextEncoder();
		const utf8Bytes = encoder.encode(mockString);

		const data: SputnikTestTextEncodingData = {
			input: {
				decode: {
					value: utf8Bytes
				},
				encode: {
					value: mockString
				}
			}
		};

		await set_doc(TEST_COLLECTION, key, {
			data: await toArray(data),
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);

		const result = await get_doc(TEST_COLLECTION, key);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		const resultData: SputnikTestTextEncodingData = await fromArray(doc.data);

		expect(resultData.output?.decoded.value).toEqual(mockString);
		expect(resultData.output?.decoded.labelNotSupported).toBe(true);
		expect(resultData.output?.decoded.inputIsNotArrayBuffer).toBe(true);

		expect(resultData.output?.encoded.value).toEqual(utf8Bytes);
		expect(resultData.output?.encoded.encodeIntoNotSupported).toBe(true);
	});
});

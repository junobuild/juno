import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import type { SputnikTestTextEncodingData } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > text-encoding', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;

	const TEST_COLLECTION = 'test-textencoding';

	beforeAll(async () => {
		const { pic: p, actor: a } = await setupTestSputnik();

		pic = p;
		actor = a;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

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
		expect(resultData.output?.decoded.labelNotSupported).toBeTruthy();
		expect(resultData.output?.decoded.inputIsNotArrayBuffer).toBeTruthy();

		expect(resultData.output?.encoded.value).toEqual(utf8Bytes);
		expect(resultData.output?.encoded.encodeIntoNotSupported).toBeTruthy();
	});
});

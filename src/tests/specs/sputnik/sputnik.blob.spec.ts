import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, jsonReplacer } from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockBlob } from '../../mocks/storage.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > math', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-blob';

	beforeAll(async () => {
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

	it('should support blob', async () => {
		await tick(pic);

		const { logs } = await setDocAndFetchLogs({
			collection: TEST_COLLECTION,
			actor,
			controller,
			canisterId,
			pic
		});

		const assertions: [string, string][] = [
			['Size:', JSON.stringify(mockBlob.size)],
			['Type:', mockBlob.type],
			['Text:', await mockBlob.text()],
			['ArrayBuffer:', JSON.stringify(await mockBlob.arrayBuffer(), jsonReplacer)],
			['Bytes:', JSON.stringify(await mockBlob.bytes(), jsonReplacer)]
		];

		for (const [key, value] of assertions) {
			const log = logs.find(([_, { message }]) => message.includes(key));

			assertNonNullish(log);

			const [_, { message }] = log;
			const printedValue = message.replace(key, '').trim();

			expect(printedValue).toEqual(value);
		}
	});
});

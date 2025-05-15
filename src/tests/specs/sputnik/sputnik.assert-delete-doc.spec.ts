import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import type { SputnikValueMock } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs, type IcMgmtLog } from '../../utils/mgmt-test.utils';

describe('Sputnik > assert_delete_doc', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'test-delete-assert';
	const TEST_NOT_ASSERTED_COLLECTION = 'test';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_ASSERTED_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, TEST_NOT_ASSERTED_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const deleteAndFetchLogs = async (collection: string): Promise<[string, IcMgmtLog][]> => {
		const { del_doc } = actor;

		const key = nanoid();

		await del_doc(collection, key, {
			version: toNullable()
		});

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	it('should not use assertDeleteDoc', async () => {
		const logs = await deleteAndFetchLogs(TEST_NOT_ASSERTED_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'assertDeleteDoc called');

		expect(log).toBeUndefined();
	});

	it('should use assertDeleteDoc', async () => {
		const logs = await deleteAndFetchLogs(TEST_ASSERTED_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'assertDeleteDoc called');

		expect(log).not.toBeUndefined();
	});

	it('should assert on document not exists', async () => {
		const logs = await deleteAndFetchLogs(TEST_ASSERTED_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'Document does not exist');

		expect(log).not.toBeUndefined();
	});

	it('should assert document can be deleted', async () => {
		const data = await toArray<SputnikValueMock>({
			value: 'ok'
		});

		const { set_doc, get_doc, del_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_ASSERTED_COLLECTION, key, {
			data,
			description: toNullable(),
			version: toNullable()
		});

		const doc = fromNullable(await get_doc(TEST_ASSERTED_COLLECTION, key));

		expect(doc).not.toBeUndefined();

		await expect(
			del_doc(TEST_ASSERTED_COLLECTION, key, {
				version: doc?.version ?? []
			})
		).resolves.not.toThrow();

		const afterDoc = fromNullable(await get_doc(TEST_ASSERTED_COLLECTION, key));

		expect(afterDoc).toBeUndefined();
	});

	it('should prevent document to be deleted', async () => {
		// The fixture disallow editing doc if it contains a value equals to "test"
		const data = await toArray<SputnikValueMock>({
			value: 'test'
		});

		const { set_doc, get_doc, del_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_ASSERTED_COLLECTION, key, {
			data,
			description: toNullable(),
			version: toNullable()
		});

		const doc = fromNullable(await get_doc(TEST_ASSERTED_COLLECTION, key));

		expect(doc).not.toBeUndefined();

		await expect(
			del_doc(TEST_ASSERTED_COLLECTION, key, {
				version: doc?.version ?? []
			})
		).rejects.toThrow(new RegExp('test keyword not allowed', 'i'));
	});
});

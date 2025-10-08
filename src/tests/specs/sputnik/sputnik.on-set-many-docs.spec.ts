import type { SputnikActor } from '$declarations';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { fromArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { valid } from 'semver';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockData } from '../../mocks/doc.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { type IcMgmtLog, fetchLogs } from '../../utils/mgmt-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { initVersionMock } from '../../utils/sputnik-tests.utils';

describe('Sputnik > on_set_many_docs', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ON_COLLECTION = 'test-onsetmanydocs';
	const TEST_NOT_ON_COLLECTION = 'test';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_ON_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, TEST_NOT_ON_COLLECTION, mockSetRule);

		await initVersionMock(actor);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setManyAndFetchLogs = async (collection: string): Promise<[string, IcMgmtLog][]> => {
		const { set_many_docs } = actor;

		const key = nanoid();

		await set_many_docs([
			[
				collection,
				key,
				{
					data: mockData,
					description: toNullable(),
					version: toNullable()
				}
			]
		]);

		await waitServerlessFunction(pic);

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	it('should not use onSetManyDocs', async () => {
		const logs = await setManyAndFetchLogs(TEST_NOT_ON_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'onSetManyDocs called');

		expect(log).toBeUndefined();
	});

	it('should use onSetManyDocs', async () => {
		const logs = await setManyAndFetchLogs(TEST_ON_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'onSetManyDocs called');

		expect(log).not.toBeUndefined();
	});

	it('should support async and call', async () => {
		const { set_many_docs, get_doc } = actor;

		const key = nanoid();

		await set_many_docs([
			[
				TEST_ON_COLLECTION,
				key,
				{
					data: mockData,
					description: toNullable(),
					version: toNullable()
				}
			]
		]);

		await waitServerlessFunction(pic);

		const result = await get_doc(TEST_ON_COLLECTION, `${key}_version`);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		const version: unknown = await fromArray(doc.data);

		expect(typeof version === 'string').toBeTruthy();
		expect(valid(version as string)).not.toBeNull();
	});
});

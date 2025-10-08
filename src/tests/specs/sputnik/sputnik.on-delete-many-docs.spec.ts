import { type SputnikActor } from '$lib/api/actors/actor.factory';
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

describe('Sputnik > on_delete_many_docs', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ON_COLLECTION = 'test-ondeletemanydocs';
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

	const deleteManyDocs = async (collection: string): Promise<{ key: string }> => {
		const { set_doc, del_many_docs } = actor;

		const key = nanoid();

		const doc = await set_doc(collection, key, {
			data: mockData,
			description: toNullable(),
			version: toNullable()
		});

		await del_many_docs([
			[
				collection,
				key,
				{
					version: doc.version
				}
			]
		]);

		return { key };
	};

	const deleteManyDocsAndFetchLogs = async (collection: string): Promise<[string, IcMgmtLog][]> => {
		await deleteManyDocs(collection);

		await waitServerlessFunction(pic);

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	const MSG = 'onDeleteManyDocs called';

	it(`should not use ${MSG}`, async () => {
		const logs = await deleteManyDocsAndFetchLogs(TEST_NOT_ON_COLLECTION);

		const log = logs.find(([_, { message }]) => message === MSG);

		expect(log).toBeUndefined();
	});

	it(`should use ${MSG}`, async () => {
		const logs = await deleteManyDocsAndFetchLogs(TEST_ON_COLLECTION);

		const log = logs.find(([_, { message }]) => message === MSG);

		expect(log).not.toBeUndefined();
	});

	it('should support async and call', async () => {
		const { key } = await deleteManyDocs(TEST_ON_COLLECTION);

		await waitServerlessFunction(pic);

		const { get_doc } = actor;

		const result = await get_doc(TEST_ON_COLLECTION, `${key}_version`);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		const version: unknown = await fromArray(doc.data);

		expect(typeof version === 'string').toBeTruthy();
		expect(valid(version as string)).not.toBeNull();
	});
});

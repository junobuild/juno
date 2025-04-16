import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { valid } from 'semver';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockData } from '../../mocks/doc.mocks';
import { mockListParams } from '../../mocks/list.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs, type IcMgmtLog } from '../../utils/mgmt-test.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { initVersionMock } from '../../utils/sputnik-tests.utils';

describe('Sputnik > on_delete_filtered_docs', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ON_COLLECTION = 'test-ondeletefiltereddocs';
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

	const deleteFilteredDocs = async (collection: string): Promise<{ key: string }> => {
		const { set_doc, del_filtered_docs } = actor;

		const key = nanoid();

		await set_doc(collection, key, {
			data: mockData,
			description: toNullable(),
			version: toNullable()
		});

		await del_filtered_docs(collection, {
			...mockListParams,
			matcher: [
				{
					key: [key],
					description: [],
					created_at: [],
					updated_at: []
				}
			]
		});

		return { key };
	};

	const deleteFilteredDocsAndFetchLogs = async (
		collection: string
	): Promise<[string, IcMgmtLog][]> => {
		await deleteFilteredDocs(collection);

		await waitServerlessFunction(pic);

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	const MSG = 'onDeleteFilteredDocs called';

	it(`should not use ${MSG}`, async () => {
		const logs = await deleteFilteredDocsAndFetchLogs(TEST_NOT_ON_COLLECTION);

		const log = logs.find(([_, { message }]) => message === MSG);

		expect(log).toBeUndefined();
	});

	it(`should use ${MSG}`, async () => {
		const logs = await deleteFilteredDocsAndFetchLogs(TEST_ON_COLLECTION);

		const log = logs.find(([_, { message }]) => message === MSG);

		expect(log).not.toBeUndefined();
	});

	it('should support async and call', async () => {
		const { key } = await deleteFilteredDocs(TEST_ON_COLLECTION);

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

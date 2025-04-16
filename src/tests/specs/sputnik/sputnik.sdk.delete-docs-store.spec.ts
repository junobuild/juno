import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import { toNullable } from '@dfinity/utils';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockListParams } from '../../mocks/list.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { addSomeDocsToBeListed } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > deleteDocsStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let controller: Identity;

	const TEST_COLLECTION = 'test-deletedocs';
	const MOCK_COLLECTION = 'demo-deletedocs';

	beforeAll(async () => {
		const { pic: p, actor: a, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, MOCK_COLLECTION, mockSetRule);

		await addSomeDocsToBeListed({
			collection: MOCK_COLLECTION,
			actor,
			controller,
			pic
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setDoc = async (): Promise<void> => {
		const { set_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: [],
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);
	};

	it('should delete all documents', async () => {
		await setDoc();

		const { list_docs } = actor;

		const docs = await list_docs(MOCK_COLLECTION, mockListParams);

		expect(docs.items_length).toEqual(0n);
	});
});

import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import { toNullable } from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockListParams } from '../../mocks/list.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { addSomeAssetsToBeListed } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > testSdkDeleteAssetsStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let controller: Identity;

	const TEST_COLLECTION = 'test-deleteassets';
	const MOCK_COLLECTION = 'demo-deleteassets';

	beforeAll(async () => {
		const { pic: p, actor: a, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, MOCK_COLLECTION, {
			...mockSetRule,
			read: { Public: null },
			write: { Public: null }
		});

		await addSomeAssetsToBeListed({
			collection: MOCK_COLLECTION,
			actor,
			controller,
			pic
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const triggerHook = async (): Promise<void> => {
		const { set_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: [],
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);
	};

	it('should delete all assets', async () => {
		await triggerHook();

		const { list_assets } = actor;

		const assets = await list_assets(MOCK_COLLECTION, mockListParams);

		expect(assets.items_length).toEqual(0n);
	});
});

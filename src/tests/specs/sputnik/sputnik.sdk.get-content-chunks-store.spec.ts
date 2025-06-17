import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockHtml } from '../../mocks/storage.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { uploadAsset } from '../../utils/satellite-storage-tests.utils';

describe('Sputnik > sdk > getContentChunksStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-getchunks';
	const MOCK_COLLECTION = 'demo-getchunks';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, MOCK_COLLECTION, {
			...mockSetRule,
			memory: toNullable({ Stable: null })
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

	it('should get content chunks', async () => {
		const name = 'hello.html';
		const fullPath = `/${MOCK_COLLECTION}/${name}`;

		await uploadAsset({
			name,
			full_path: fullPath,
			collection: MOCK_COLLECTION,
			actor
		});

		await triggerHook();

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const chunkMsg = logs.find(([_, { message }]) => message.includes('Chunk:'));

		assertNonNullish(chunkMsg);

		expect(chunkMsg[1].message.replace('Chunk:', '').trim()).toEqual(mockHtml);
	});
});

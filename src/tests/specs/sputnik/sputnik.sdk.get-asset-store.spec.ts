import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { uploadAsset } from '../../utils/satellite-storage-tests.utils';

describe('Sputnik > sdk > getAssetStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-getasset';
	const MOCK_COLLECTION = 'demo-getasset';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, MOCK_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const triggerHook = async (fullPath: string): Promise<void> => {
		const { set_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: await toArray(fullPath),
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);
	};

	it('should get asset', async () => {
		const fullPath = `/${MOCK_COLLECTION}/hello.html`;

		await uploadAsset({
			name: nanoid(),
			full_path: fullPath,
			collection: MOCK_COLLECTION,
			actor
		});

		await triggerHook(fullPath);

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const nullishMsg = logs.find(([_, { message }]) => message.includes('Nullish:'));

		expect(nullishMsg).not.toBeUndefined();

		expect(
			(nullishMsg?.[1].message ?? 'true').replace('Nullish:', '').trim() === 'false'
		).toBeTruthy();
	});
});

import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-test.utils';
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
		await set_rule({ Storage: null }, MOCK_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should get content chunks', async () => {
		const fullPath = `/${MOCK_COLLECTION}/hello.html`;

		await uploadAsset({
			name: nanoid(),
			full_path: fullPath,
			collection: MOCK_COLLECTION,
			actor
		});

		const {get_asset} = actor;

		const assetNoContent = await get_asset(MOCK_COLLECTION, fullPath);

		const asset = fromNullable(assetNoContent);

		assertNonNullish(asset);

		console.log(asset.encodings);

	});
});

import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { setupTestSatellite } from '../../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../../utils/satellite-extended-tests.utils';
import {
	assertHttpRequestCode,
	uploadAssetWithToken
} from '../../../utils/satellite-storage-tests.utils';

describe('Satellite > Sdk > Token', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	const TEST_COLLECTION = 'test_token';

	beforeAll(async () => {
		const { pic: p, actor: a } = await setupTestSatellite();

		pic = p;
		actor = a;

		const { set_rule } = actor;
		await set_rule({ Storage: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should update token after hook run', async () => {
		const { fullPathWithToken, fullPath } = await uploadAssetWithToken({
			collection: TEST_COLLECTION,
			actor
		});

		await assertHttpRequestCode({ url: fullPathWithToken, code: 200, actor });

		await waitServerlessFunction(pic);

		await assertHttpRequestCode({ url: fullPathWithToken, code: 404, actor });
		await assertHttpRequestCode({ url: `${fullPath}?token=123456-update`, code: 200, actor });
	});
});

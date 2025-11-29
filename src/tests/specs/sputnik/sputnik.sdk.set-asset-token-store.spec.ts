import type { SatelliteDid, SputnikActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { uploadAsset } from '../../utils/satellite-storage-tests.utils';

describe('Sputnik > sdk > setAssetTokenStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;

	const TEST_COLLECTION = 'test-setassettoken';
	const MOCK_COLLECTION = 'demo-setassettoken';

	beforeAll(async () => {
		const { pic: p, actor: a } = await setupTestSputnik();

		pic = p;
		actor = a;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, MOCK_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertHttpRequest = async ({ url, code }: { url: string; code: 200 | 404 }) => {
		const { http_request } = actor;

		const request: SatelliteDid.HttpRequest = {
			body: Uint8Array.from([]),
			certificate_version: toNullable(2),
			headers: [],
			method: 'GET',
			url
		};

		const response = await http_request(request);

		const { status_code } = response;

		expect(status_code).toEqual(code);
	};

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

	it('should set token asset', async () => {
		const fullPath = `/${MOCK_COLLECTION}/hello.html`;

		await uploadAsset({
			name: nanoid(),
			full_path: fullPath,
			collection: MOCK_COLLECTION,
			actor
		});

		const { get_asset } = actor;

		const asset = await get_asset(MOCK_COLLECTION, fullPath);

		expect(fromNullable(asset)).not.toBeUndefined();

		await triggerHook(fullPath);

		const assetAfterHook = await get_asset(MOCK_COLLECTION, fullPath);

		expect(fromNullable(assetAfterHook)?.key.token).toEqual(toNullable('123456-update'));

		await assertHttpRequest({ url: fullPath, code: 404 });
		await assertHttpRequest({ url: `${fullPath}?token=123456-update`, code: 200 });
	});
});

import type { SatelliteDid } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { arrayOfNumberToUint8Array, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { nanoid } from 'nanoid';
import { mockPrincipal } from '../../../../frontend/tests/mocks/identity.mock';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { setupTestSatellite } from '../../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../../utils/satellite-extended-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';

describe('Satellite > Sdk > Token', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test_token';

	const upload = async (params: {
		full_path: string;
		name: string;
		collection: string;
		token?: string;
		headers?: [string, string][];
	}) => {
		await uploadAsset({
			...params,
			actor
		});
	};

	const uploadAssetWithToken = async ({
		collection,
		headers
	}: {
		collection: string;
		headers?: [string, string][];
	}): Promise<{ fullPathWithToken: string; fullPath: string }> => {
		const name = `hello-${nanoid()}.html`;
		const full_path = `/${collection}/${name}`;
		const token = nanoid();

		await upload({ full_path, name, collection, token, headers });

		return { fullPathWithToken: `${full_path}?token=${token}`, fullPath: full_path };
	};

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

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSatellite();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Storage: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const mockData = {
		hello: 12367894n,
		whoami: mockPrincipal,
		arr: arrayOfNumberToUint8Array([1, 2, 3, 4, 5])
	};

	it('should update token after hook run', async () => {
		const { fullPathWithToken, fullPath } = await uploadAssetWithToken({
			collection: TEST_COLLECTION
		});

		await assertHttpRequest({ url: fullPathWithToken, code: 200 });

		await waitServerlessFunction(pic);

		await assertHttpRequest({ url: fullPathWithToken, code: 404 });
		await assertHttpRequest({ url: `${fullPath}?token=123456-update`, code: 200 });
	});
});

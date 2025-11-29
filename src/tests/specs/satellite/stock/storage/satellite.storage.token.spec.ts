import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { nanoid } from 'nanoid';
import { assertCertification } from '../../../../utils/certification-tests.utils';
import {
	assertHttpRequestCode,
	uploadAssetWithToken
} from '../../../../utils/satellite-storage-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe('Satellite > Storage > Token', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	let canisterId: Principal;
	let currentDate: Date;

	const createCollection = async ({
		collection,
		memory
	}: {
		collection: string;
		memory: { Heap: null } | { Stable: null };
	}) => {
		const { set_rule } = actor;

		const setRule: SatelliteDid.SetRule = {
			memory: toNullable(memory),
			max_size: toNullable(),
			max_capacity: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(),
			write: { Managed: null },
			version: toNullable(),
			rate_config: toNullable(),
			max_changes_per_user: toNullable()
		};

		await set_rule({ Storage: null }, collection, setRule);
	};

	beforeAll(async () => {
		const { actor: a, pic: p, currentDate: cD, canisterId: cI } = await setupSatelliteStock();

		pic = p;
		actor = a;
		currentDate = cD;
		canisterId = cI;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
		'With collection',
		({ memory }) => {
			const collection = `test_${'Heap' in memory ? 'heap' : 'stable'}`;

			beforeAll(async () => {
				await createCollection({
					collection,
					memory
				});
			});

			it('should return asset with token', async () => {
				const { http_request } = actor;

				const { fullPathWithToken } = await uploadAssetWithToken({ collection, actor });

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: fullPathWithToken
				};

				const response = await http_request(request);

				const { status_code } = response;

				expect(status_code).toEqual(200);
			});

			it('should not return asset without token', async () => {
				const { http_request } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: fullPath
				};

				const response = await http_request(request);

				const { status_code } = response;

				expect(status_code).toEqual(404);
			});

			it('should not return asset with invalid token', async () => {
				const { http_request } = actor;

				const { fullPathWithToken } = await uploadAssetWithToken({ collection, actor });

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: `${fullPathWithToken}-invalid`
				};

				const response = await http_request(request);

				const { status_code } = response;

				expect(status_code).toEqual(404);
			});

			it('should update token and return asset', async () => {
				const { set_asset_token } = actor;

				const { fullPath, fullPathWithToken } = await uploadAssetWithToken({ collection, actor });

				const newToken = nanoid();

				await set_asset_token(collection, fullPath, toNullable(newToken));

				await assertHttpRequestCode({ url: `${fullPath}?token=${newToken}`, code: 200, actor });
				await assertHttpRequestCode({ url: fullPathWithToken, code: 404, actor });
			});

			it('should reset token and return asset without', async () => {
				const { set_asset_token } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				await assertHttpRequestCode({ url: fullPath, code: 404, actor });

				await set_asset_token(collection, fullPath, toNullable());

				await assertHttpRequestCode({ url: fullPath, code: 200, actor });
			});

			it('should prevent indexing and caching by crawlers or intermediaries with headers', async () => {
				const { http_request } = actor;

				const { fullPathWithToken } = await uploadAssetWithToken({ collection, actor });

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: fullPathWithToken
				};

				const response = await http_request(request);

				const { headers } = response;

				const xRobotsTag = headers.find(([key, _]) => key === 'x-robots-tag');

				expect(xRobotsTag?.[1]).toEqual('noindex, nofollow');

				const cacheControl = headers.find(([key, _]) => key === 'cache-control');

				expect(cacheControl?.[1]).toEqual('private, no-store');
			});

			it('should use cache-control no-store header over asset and configs', async () => {
				const { http_request } = actor;

				const customCacheControl = 'public, max-age=3600';

				const customHeaders: [string, string][] = [['cache-control', customCacheControl]];

				const { fullPathWithToken } = await uploadAssetWithToken({
					collection,
					actor,
					headers: customHeaders
				});

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: fullPathWithToken
				};

				const response = await http_request(request);

				const { headers } = response;

				const cacheControl = headers.find(([key, _]) => key === 'cache-control');

				expect(cacheControl?.[1]).toEqual('private, no-store');
			});

			it('should remove indexing and caching prevention', async () => {
				const { http_request, set_asset_token } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				await set_asset_token(collection, fullPath, toNullable());

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: fullPath
				};

				const response = await http_request(request);

				const { headers } = response;

				const xRobotsTag = headers.find(([key, _]) => key === 'x-robots-tag');

				expect(xRobotsTag).toBeUndefined();

				const cacheControl = headers.find(([key, _]) => key === 'cache-control');

				expect(cacheControl).toBeUndefined();
			});

			it('should redo indexing and caching prevention', async () => {
				const { http_request, set_asset_token } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				await set_asset_token(collection, fullPath, toNullable());

				const token = nanoid();

				await set_asset_token(collection, fullPath, toNullable(token));

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: `${fullPath}?token=${token}`
				};

				const response = await http_request(request);

				const { headers } = response;

				const xRobotsTag = headers.find(([key, _]) => key === 'x-robots-tag');

				expect(xRobotsTag?.[1]).toEqual('noindex, nofollow');

				const cacheControl = headers.find(([key, _]) => key === 'cache-control');

				expect(cacheControl?.[1]).toEqual('private, no-store');
			});

			it('should still provide indexing and caching prevention', async () => {
				const { http_request, set_asset_token } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				const token = nanoid();

				await set_asset_token(collection, fullPath, toNullable(token));

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: `${fullPath}?token=${token}`
				};

				const response = await http_request(request);

				const { headers } = response;

				const xRobotsTag = headers.find(([key, _]) => key === 'x-robots-tag');

				expect(xRobotsTag?.[1]).toEqual('noindex, nofollow');

				const cacheControl = headers.find(([key, _]) => key === 'cache-control');

				expect(cacheControl?.[1]).toEqual('private, no-store');
			});

			it('should update certification on remove token', async () => {
				const { http_request, set_asset_token } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				await set_asset_token(collection, fullPath, toNullable());

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: fullPath
				};

				const response = await http_request(request);

				await assertCertification({
					canisterId,
					pic,
					request,
					response,
					currentDate,
					statusCode: 200
				});
			});

			it('should update certification on redo token', async () => {
				const { http_request, set_asset_token } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection, actor });

				await set_asset_token(collection, fullPath, toNullable());

				const token = nanoid();

				await set_asset_token(collection, fullPath, toNullable(token));

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: `${fullPath}?token=${token}`
				};

				const response = await http_request(request);

				await assertCertification({
					canisterId,
					pic,
					request,
					response,
					currentDate,
					statusCode: 200
				});
			});
		}
	);
});

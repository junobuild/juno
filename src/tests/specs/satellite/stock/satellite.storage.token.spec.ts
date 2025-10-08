import type { SatelliteActor } from '$lib/api/actors/actor.factory';
import type { SatelliteDid } from '$lib/types/declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { nanoid } from 'nanoid';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';

describe('Satellite > Storage > Token', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

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
		const { actor: a, pic: p } = await setupSatelliteStock();

		pic = p;
		actor = a;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

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

			it('should not return asset without token', async () => {
				const { http_request } = actor;

				const { fullPath } = await uploadAssetWithToken({ collection });

				const request: SatelliteDid.HttpRequest = {
					body: [],
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

				const { fullPathWithToken } = await uploadAssetWithToken({ collection });

				const request: SatelliteDid.HttpRequest = {
					body: [],
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: `${fullPathWithToken}-invalid`
				};

				const response = await http_request(request);

				const { status_code } = response;

				expect(status_code).toEqual(404);
			});

			it('should prevent indexing and caching by crawlers or intermediaries with headers', async () => {
				const { http_request } = actor;

				const { fullPathWithToken } = await uploadAssetWithToken({ collection });

				const request: SatelliteDid.HttpRequest = {
					body: [],
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
					headers: customHeaders
				});

				const request: SatelliteDid.HttpRequest = {
					body: [],
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
		}
	);
});

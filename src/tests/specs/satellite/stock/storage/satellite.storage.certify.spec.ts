import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, nonNullish, toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER } from '@junobuild/errors';
import { MEMORIES } from '../../../../constants/satellite-tests.constants';
import { assertCertification } from '../../../../utils/certification-tests.utils';
import { uploadAsset } from '../../../../utils/satellite-storage-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe('Satellite > Storage > certify_assets_chunk', () => {
	let pic: PocketIc;
	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let currentDate: Date;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			currentDate: cD,
			pic: p,
			controller: cO
		} = await setupSatelliteStock();

		pic = p;
		canisterId = c;
		actor = a;
		currentDate = cD;
		controller = cO;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assets = ['hello1.html', 'hello2.html', 'hello3.html'];

	const upload = async () => {
		for (const name of assets) {
			await uploadAsset({ full_path: `/${name}`, name, collection: '#dapp', actor });
		}
	};

	const certifyChunks = async ({
		cursor,
		strategy,
		appendStrategy = { AppendWithRouting: null }
	}: {
		cursor: SatelliteDid.CertifyAssetsCursor;
		strategy: SatelliteDid.CertifyAssetsStrategy;
		appendStrategy?: SatelliteDid.CertifyAssetsStrategy;
	}) => {
		const { certify_assets_chunk } = actor;

		const result = await certify_assets_chunk({
			cursor,
			chunk_size: toNullable(2),
			strategy
		});

		const next = fromNullable(result.next_cursor);

		if (nonNullish(next)) {
			await certifyChunks({ cursor: next, strategy: appendStrategy });
		}
	};

	const assertAssets = async () => {
		const { http_request } = actor;

		for (const name of assets) {
			const full_path = `/${name}`;

			const request: SatelliteDid.HttpRequest = {
				body: Uint8Array.from([]),
				certificate_version: toNullable(2),
				headers: [],
				method: 'GET',
				url: full_path
			};

			const response = await http_request(request);

			await assertCertification({ canisterId, pic, request, response, currentDate });
		}
	};

	describe.each(MEMORIES)('$title', ({ memory }) => {
		beforeAll(async () => {
			const { del_assets, switch_storage_system_memory } = actor;

			await del_assets('#dapp');

			if ('Stable' in memory) {
				await switch_storage_system_memory();
			}

			await upload();
		});

		it('should not certify assets beyond current chunk', async () => {
			const { certify_assets_chunk, http_request } = actor;

			await certify_assets_chunk({
				cursor: 'Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } },
				chunk_size: toNullable(2),
				strategy: { Clear: null }
			});

			const request: SatelliteDid.HttpRequest = {
				body: Uint8Array.from([]),
				certificate_version: toNullable(2),
				headers: [],
				method: 'GET',
				url: '/hello3.html'
			};

			const response = await http_request(request);

			await expect(
				assertCertification({ canisterId, pic, request, response, currentDate })
			).rejects.toThrow();
		});

		it('should certify all assets chunk by chunk', async () => {
			await certifyChunks({
				cursor: 'Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } },
				strategy: { Clear: null }
			});
			await assertAssets();
		});

		describe('With routing', () => {
			beforeAll(async () => {
				const { set_storage_config } = actor;

				await set_storage_config({
					headers: [],
					iframe: toNullable(),
					redirects: [],
					rewrites: [['/unknown.html', '/hello1.html']],
					raw_access: toNullable(),
					max_memory_size: toNullable(),
					version: toNullable("Heap" in memory ? 1n : 3n),
					skip_certification: []
				});
			});

			it('should apply routing on last chunk', async () => {
				const { http_request } = actor;

				await certifyChunks({
					cursor: 'Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } },
					strategy: { Clear: null }
				});

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: '/unknown.html'
				};

				const response = await http_request(request);

				await assertCertification({ canisterId, pic, request, response, currentDate });
			});

			it('should not apply routing without AppendWithRouting strategy', async () => {
				const { certify_assets_chunk, http_request } = actor;

				await certify_assets_chunk({
					cursor: 'Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } },
					chunk_size: toNullable(2),
					strategy: { Clear: null }
				});

				await certifyChunks({
					cursor: 'Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } },
					strategy: { Clear: null },
					appendStrategy: { Append: null }
				});

				const request: SatelliteDid.HttpRequest = {
					body: Uint8Array.from([]),
					certificate_version: toNullable(2),
					headers: [],
					method: 'GET',
					url: '/unknown.html'
				};

				const response = await http_request(request);

				await expect(
					assertCertification({ canisterId, pic, request, response, currentDate })
				).rejects.toThrow();
			});
		});

		it('should not re-certify assets when skip_certification is set', async () => {
			const { certify_assets_chunk, set_storage_config, http_request } = actor;

			await certify_assets_chunk({
				cursor: 'Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } },
				chunk_size: toNullable(2),
				strategy: { Clear: null }
			});

			await set_storage_config({
				headers: [],
				iframe: toNullable(),
				redirects: [],
				rewrites: [],
				raw_access: toNullable(),
				max_memory_size: toNullable(),
				version: toNullable('Heap' in memory ? 2n : 4n),
				skip_certification: toNullable(true)
			});

			const request: SatelliteDid.HttpRequest = {
				body: Uint8Array.from([]),
				certificate_version: toNullable(2),
				headers: [],
				method: 'GET',
				url: '/hello3.html'
			};

			const response = await http_request(request);

			await expect(
				assertCertification({ canisterId, pic, request, response, currentDate })
			).rejects.toThrow();
		});
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should throw if not admin', async () => {
			const { certify_assets_chunk } = actor;

			await expect(
				certify_assets_chunk({
					cursor: { Heap: { offset: 0n } },
					chunk_size: toNullable(2),
					strategy: { Clear: null }
				})
			).rejects.toThrow(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER);
		});
	});
});

import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, nonNullish, toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
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

	const certifyChunks = async (cursor: SatelliteDid.CertifyAssetsCursor) => {
		const { certify_assets_chunk } = actor;

		const result = await certify_assets_chunk({
			cursor,
			chunk_size: toNullable(2)
		});

		const next = fromNullable(result.next_cursor);

		if (nonNullish(next)) {
			await certifyChunks(next);
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

		it('should certify all assets chunk by chunk', async () => {
			await certifyChunks('Heap' in memory ? { Heap: { offset: 0n } } : { Stable: { key: [] } });
			await assertAssets();
		});
	});
});

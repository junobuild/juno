import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { beforeAll, describe, inject } from 'vitest';
import { mockListParams } from '../../../mocks/list.mocks';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Controllers', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Submit', () => {
		const controllerSubmit = Ed25519KeyIdentity.generate();

		const COLLECTION_DAPP = '#dapp';
		const ITEMS = Array.from({ length: 5 });

		const upload = async ({ index }: { index: number }) => {
			const name = `hello-${index}.html`;
			const full_path = `/hello/${name}`;

			await uploadAsset({
				full_path,
				name,
				collection: COLLECTION_DAPP,
				actor
			});
		};

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Submit: null },
					metadata: [],
					expires_at: []
				},
				controllers: [controllerSubmit.getPrincipal()]
			});

			await Promise.all(ITEMS.map(async (_, index) => await upload({ index })));

			actor.setIdentity(controllerSubmit);
		});

		it('should list assets of collection #dapp', async () => {
			const { list_assets } = actor;

			const { items_length, items } = await list_assets(COLLECTION_DAPP, mockListParams);

			// Items + default index.html
			expect(items_length).toEqual(BigInt(ITEMS.length) + 1n);

			expect(items.find(([fullPath, _]) => fullPath === '/index.html')).not.toBeUndefined();

			for (let i = 0; i < ITEMS.length; i++) {
				const asset = items.find(([fullPath, _]) => fullPath === `/hello/hello-${i}.html`);

				expect(asset).not.toBeUndefined();
			}
		});
	});
});

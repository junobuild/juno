import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { MEMORIES } from '../../../../constants/satellite-tests.constants';
import { testStorageAndConfig } from '../../../../utils/satellite-storage-suite-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';

describe.each([{ title: 'Heap (default)', memory: null }, ...MEMORIES])(
	'Satellite > Storage with Options > $title',
	({ memory }) => {
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
			} = await setupSatelliteStock({
				withIndexHtml: true,
				memory
			});

			pic = p;
			canisterId = c;
			actor = a;
			currentDate = cD;
			controller = cO;
		});

		afterAll(async () => {
			await pic?.tearDown();
		});

		testStorageAndConfig({
			pic: () => pic,
			currentDate: () => currentDate,
			controller: () => controller,
			actor: () => actor,
			canisterId: () => canisterId,
			setStorageConfig: async ({ actor, config }) => {
				const { set_storage_config_with_options } = actor;
				return await set_storage_config_with_options({
					config,
					options: {
						skip_certification: [false]
					}
				});
			}
		});
	}
);

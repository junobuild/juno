import type { _SERVICE as SatelliteActor_0_0_16 } from '$declarations/deprecated/satellite-0-0-16.did';
import { idlFactory as idlFactorSatellite_0_0_16 } from '$declarations/deprecated/satellite-0-0-16.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import {
	initUsers,
	testUsers,
	upgradeSatelliteVersion
} from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.0.15 -> v0.0.16', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	describe('v0.0.15 -> v0.0.16', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.15');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it(
			'should add users after upgrade and still list all users from heap',
			{
				timeout: 120000
			},
			async () => {
				await initUsers(actor);

				const users = await initUsers(actor);

				await testUsers({ users, actor });

				await upgradeSatelliteVersion({ version: '0.0.16', canisterId, pic, controller });

				const moreUsers = await initUsers(actor);

				await testUsers({ users: [...users, ...moreUsers], actor });
			}
		);

		it('should keep listing existing heap collections as such', async () => {
			const { set_rule, list_rules } = actor;

			await set_rule({ Db: null }, 'test', {
				memory: toNullable({ Heap: null }),
				updated_at: toNullable(),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				max_capacity: toNullable()
			});

			const testCollection = async () => {
				const [[collection, { memory }], _] = await list_rules({
					Db: null
				});

				expect(collection).toEqual('test');
				expect(memory).toEqual(toNullable({ Heap: null }));
			};

			await testCollection();

			await upgradeSatelliteVersion({ version: '0.0.16', canisterId, pic, controller });

			await testCollection();
		});
	});

	describe('v0.0.16 -> v0.0.16', () => {
		let actor: Actor<SatelliteActor_0_0_16>;

		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadSatellite('0.0.16');

			const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor_0_0_16>({
				idlFactory: idlFactorSatellite_0_0_16,
				wasm: destination,
				arg: controllersInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		it('should keep users', async () => {
			await initUsers(actor);

			const users = await initUsers(actor);

			await testUsers({ users, actor });

			await upgradeSatelliteVersion({ version: '0.0.16', canisterId, pic, controller });

			await testUsers({ users, actor });
		});
	});
});

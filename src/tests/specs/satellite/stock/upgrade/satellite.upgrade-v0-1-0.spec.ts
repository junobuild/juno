import {
	idlFactorySatellite,
	idlFactorySatellite0021,
	type SatelliteActor,
	type SatelliteActor0021
} from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { upgradeSatelliteVersion } from '../../../../utils/satellite-upgrade-tests.utils';
import { controllersInitArgs, downloadSatellite } from '../../../../utils/setup-tests.utils';

describe('Satellite > Upgrade > v0.1.0', () => {
	let pic: PocketIc;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	// For simplicity reason we also use actor v0.0.21 as the API was similar for version.
	let actor: Actor<SatelliteActor0021>;

	const PREVIOUS_VERSION = '0.0.22';

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadSatellite(PREVIOUS_VERSION);

		const { actor: c, canisterId: cId } = await pic.setupCanister<SatelliteActor0021>({
			idlFactory: idlFactorySatellite0021,
			wasm: destination,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should deprecated build version', async () => {
		await expect(actor.build_version()).resolves.toEqual(PREVIOUS_VERSION);

		await upgradeSatelliteVersion({ version: '0.1.0', controller, canisterId, pic });

		await expect(async () => await actor.build_version()).rejects.toThrow(
			new RegExp("Canister has no query method 'build_version'.", 'i')
		);
	});

	it('should deprecate version', async () => {
		await expect(actor.version()).resolves.toEqual(PREVIOUS_VERSION);

		await upgradeSatelliteVersion({ version: '0.1.0', controller, canisterId, pic });

		await expect(async () => await actor.version()).rejects.toThrow(
			new RegExp("Canister has no query method 'version'.", 'i')
		);
	});

	it('should create collection #_juno/releases', async () => {
		await upgradeSatelliteVersion({ version: '0.1.0', controller, canisterId, pic });

		const { get_rule } = actor;

		const result = await get_rule({ Storage: null }, '#_juno/releases');

		const rule = fromNullable(result);

		assertNonNullish(rule);

		const { updated_at, created_at, memory, mutable_permissions, read, write, version } = rule;

		expect(memory).toEqual(toNullable({ Heap: null }));
		expect(read).toEqual({ Controllers: null });
		expect(write).toEqual({ Controllers: null });
		expect(mutable_permissions).toEqual([false]);
		expect(created_at).toBeGreaterThan(0n);
		expect(updated_at).toBeGreaterThan(0n);
		expect(fromNullable(version)).toBeUndefined();
	});

	it('should preserve controllers even if scope enum is extended', async () => {
		const user1 = Ed25519KeyIdentity.generate();
		const user2 = Ed25519KeyIdentity.generate();
		const admin1 = Ed25519KeyIdentity.generate();

		const { set_controllers } = actor;

		await set_controllers({
			controller: {
				scope: { Write: null },
				metadata: [['hello', 'world']],
				expires_at: []
			},
			controllers: [user1.getPrincipal(), user2.getPrincipal()]
		});

		await set_controllers({
			controller: {
				scope: { Admin: null },
				metadata: [['super', 'top']],
				expires_at: []
			},
			controllers: [admin1.getPrincipal()]
		});

		const assertControllers = async (actor: SatelliteActor | SatelliteActor0021) => {
			const { list_controllers } = actor;

			const controllers = await list_controllers();

			expect(
				controllers.find(([p, _]) => p.toText() === controller.getPrincipal().toText())
			).not.toBeUndefined();

			const assertWriteController = (controller: Principal) => {
				const maybeUser = controllers.find(([p, _]) => p.toText() === controller.toText());
				assertNonNullish(maybeUser);

				expect(maybeUser[1].scope).toEqual({ Write: null });
				expect(maybeUser[1].metadata).toEqual([['hello', 'world']]);
			};

			assertWriteController(user1.getPrincipal());
			assertWriteController(user2.getPrincipal());

			const maybeAdmin = controllers.find(
				([p, _]) => p.toText() === admin1.getPrincipal().toText()
			);
			assertNonNullish(maybeAdmin);

			expect(maybeAdmin[1].scope).toEqual({ Admin: null });
			expect(maybeAdmin[1].metadata).toEqual([['super', 'top']]);
		};

		await assertControllers(actor);

		await upgradeSatelliteVersion({ version: '0.1.0', controller, canisterId, pic });

		const newActor = pic.createActor<SatelliteActor>(idlFactorySatellite, canisterId);
		newActor.setIdentity(controller);

		await assertControllers(newActor);
	});
});

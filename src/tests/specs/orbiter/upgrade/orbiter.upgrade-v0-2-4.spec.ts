import {
	type OrbiterActor,
	type OrbiterActor020,
	type OrbiterDid020,
	idlFactoryOrbiter,
	idlFactoryOrbiter020
} from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { tick } from '../../../utils/pic-tests.utils';
import {
	controllersInitArgs,
	downloadOrbiter,
	ORBITER_WASM_PATH
} from '../../../utils/setup-tests.utils';

describe('Orbiter > Upgrade > v0.2.3 -> v0.2.4', () => {
	let pic: PocketIc;
	let actor: Actor<OrbiterActor020>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: ORBITER_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const setControllers = async (): Promise<[Principal, OrbiterDid020.SetController][]> => {
		const { set_controllers } = actor;

		const user1 = Ed25519KeyIdentity.generate();
		const user2 = Ed25519KeyIdentity.generate();
		const admin1 = Ed25519KeyIdentity.generate();

		const controllerWrite: OrbiterDid020.SetController = {
			scope: { Write: null },
			metadata: [['hello', 'world']],
			expires_at: []
		};

		const controllerAdmin: OrbiterDid020.SetController = {
			scope: { Admin: null },
			metadata: [['super', 'top']],
			expires_at: [1n]
		};

		await set_controllers({
			controller: controllerWrite,
			controllers: [user1.getPrincipal(), user2.getPrincipal()]
		});

		await set_controllers({
			controller: controllerAdmin,
			controllers: [admin1.getPrincipal()]
		});

		return [
			[user1.getPrincipal(), controllerWrite],
			[user2.getPrincipal(), controllerWrite],
			[admin1.getPrincipal(), controllerAdmin]
		];
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadOrbiter('0.0.7');

		const { actor: c, canisterId: cId } = await pic.setupCanister<OrbiterActor020>({
			idlFactory: idlFactoryOrbiter020,
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

	it('should still provide controllers after upgrade', async () => {
		const controllers = await setControllers();

		await upgrade();

		const newActor = pic.createActor<OrbiterActor>(idlFactoryOrbiter, canisterId);
		newActor.setIdentity(controller);

		const { list_controllers } = newActor;

		const controllersAfterUpgrade = await list_controllers();

		for (const [principal, controller] of controllers) {
			const entry = controllersAfterUpgrade.find(([p]) => p.toText() === principal.toText());

			expect(entry).not.toBeUndefined();

			expect(entry?.[1].metadata).toEqual(controller.metadata);
			expect(entry?.[1].scope).toEqual(controller.scope);
			expect(entry?.[1].expires_at).toEqual(controller.expires_at);

			expect(entry?.[1].kind).toEqual(toNullable());
		}
	});
});

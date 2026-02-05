import {
	type ObservatoryActor,
	type ObservatoryActor040,
	type ObservatoryDid040,
	idlFactoryObservatory,
	idlFactoryObservatory040
} from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { OBSERVATORY_ID } from '../../../constants/observatory-tests.constants';
import { tick } from '../../../utils/pic-tests.utils';
import { downloadObservatory, OBSERVATORY_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Observatory > Upgrade > v0.5.0 -> v0.5.1', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor040>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const setControllers = async (): Promise<[Principal, ObservatoryDid040.SetController][]> => {
		const { set_controllers } = actor;

		const user1 = Ed25519KeyIdentity.generate();
		const user2 = Ed25519KeyIdentity.generate();
		const admin1 = Ed25519KeyIdentity.generate();

		const controllerWrite: ObservatoryDid040.SetController = {
			scope: { Write: null },
			metadata: [['hello', 'world']],
			expires_at: []
		};

		const controllerAdmin: ObservatoryDid040.SetController = {
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

		const destination = await downloadObservatory({ junoVersion: '0.0.67', version: '0.5.0' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ObservatoryActor040>({
			idlFactory: idlFactoryObservatory040,
			wasm: destination,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
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

		const newActor = pic.createActor<ObservatoryActor>(idlFactoryObservatory, canisterId);
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

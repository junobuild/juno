import {
	type MissionControlActor,
	type MissionControlActor0014,
	type MissionControlDid0013,
	idlFactoryMissionControl,
	idlFactoryMissionControl0014
} from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { missionControlUserInitArgs } from '../../../utils/mission-control-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import {
	downloadMissionControl,
	MISSION_CONTROL_WASM_PATH
} from '../../../utils/setup-tests.utils';

describe('Mission Control > Upgrade > v0.1.2 -> v0.2.0', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor0014>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: MISSION_CONTROL_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	const setControllers = async (): Promise<[Principal, MissionControlDid0013.SetController][]> => {
		const { set_mission_control_controllers } = actor;

		const user1 = Ed25519KeyIdentity.generate();
		const user2 = Ed25519KeyIdentity.generate();
		const admin1 = Ed25519KeyIdentity.generate();

		const controllerWrite: MissionControlDid0013.SetController = {
			scope: { Write: null },
			metadata: [['hello', 'world']],
			expires_at: []
		};

		const controllerAdmin: MissionControlDid0013.SetController = {
			scope: { Admin: null },
			metadata: [['super', 'top']],
			expires_at: [1n]
		};

		await set_mission_control_controllers(
			[user1.getPrincipal(), user2.getPrincipal()],
			controllerWrite
		);

		await set_mission_control_controllers([admin1.getPrincipal()], controllerAdmin);

		return [
			[user1.getPrincipal(), controllerWrite],
			[user2.getPrincipal(), controllerWrite],
			[admin1.getPrincipal(), controllerAdmin]
		];
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadMissionControl('0.1.2');

		const { actor: c, canisterId: mId } = await pic.setupCanister<MissionControlActor0014>({
			idlFactory: idlFactoryMissionControl0014,
			wasm: destination,
			arg: missionControlUserInitArgs(controller.getPrincipal()),
			sender: controller.getPrincipal()
		});

		// Mission Control needs to control itself to be able to set_mission_control_controllers
		await pic.updateCanisterSettings({
			canisterId: mId,
			controllers: [controller.getPrincipal(), mId],
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = mId;

		actor.setIdentity(controller);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should still provide controllers after upgrade', async () => {
		const controllers = await setControllers();

		await upgrade();

		const newActor = pic.createActor<MissionControlActor>(idlFactoryMissionControl, canisterId);
		newActor.setIdentity(controller);

		const { list_mission_control_controllers } = newActor;

		const controllersAfterUpgrade = await list_mission_control_controllers();

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

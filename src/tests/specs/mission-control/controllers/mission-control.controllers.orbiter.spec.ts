import {
	idlFactoryMissionControl,
	idlFactoryOrbiter,
	type MissionControlActor,
	type OrbiterActor
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { ORBITER_CONTROLLER_ERR_MSG } from '../../../constants/orbiter-tests.constants';
import { missionControlUserInitArgs } from '../../../utils/mission-control-tests.utils';
import {
	controllersInitArgs,
	MISSION_CONTROL_WASM_PATH,
	ORBITER_WASM_PATH
} from '../../../utils/setup-tests.utils';

describe('Mission Control > Controllers > Orbiter', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let orbiterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): Uint8Array => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactoryMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		const { canisterId } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactoryOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
			sender: controller.getPrincipal()
		});

		orbiterId = canisterId;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should not be able to set an orbiter because mission control is effectively not a controller', async () => {
		const { set_orbiter } = actor;

		await expect(set_orbiter(orbiterId, ['Hello'])).rejects.toThrowError(
			new RegExp(ORBITER_CONTROLLER_ERR_MSG)
		);
	});
});

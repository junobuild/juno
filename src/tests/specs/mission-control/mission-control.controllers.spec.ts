import {
	idlFactoryMissionControl,
	idlFactoryOrbiter,
	idlFactorySatellite,
	type MissionControlActor,
	type OrbiterActor,
	type SatelliteActor
} from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER } from '@junobuild/errors';
import { inject } from 'vitest';
import { ORBITER_CONTROLLER_ERR_MSG } from '../../constants/orbiter-tests.constants';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import {
	controllersInitArgs,
	MISSION_CONTROL_WASM_PATH,
	ORBITER_WASM_PATH,
	SATELLITE_WASM_PATH
} from '../../utils/setup-tests.utils';

describe('Mission Control > Controllers', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

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

		const { canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
			sender: controller.getPrincipal()
		});

		satelliteId = cId;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should not be able to set an orbiter because mission control is effectively not a controller', async () => {
		const { set_orbiter } = actor;

		await expect(set_orbiter(orbiterId, ['Hello'])).rejects.toThrow(
			new RegExp(ORBITER_CONTROLLER_ERR_MSG)
		);
	});

	it('should not be able to set a satellite because mission control is effectively not a controller', async () => {
		const { set_satellite } = actor;

		await expect(set_satellite(satelliteId, ['Hello'])).rejects.toThrow(
			new RegExp(JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER)
		);
	});
});

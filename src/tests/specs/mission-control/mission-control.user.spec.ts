import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG } from '../../constants/mission-control-tests.constants';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import {
	MISSION_CONTROL_WASM_PATH,
	SATELLITE_WASM_PATH,
	controllersInitArgs
} from '../../utils/setup-tests.utils';

describe('Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let satelliteId: Principal;

	const incorrectUser = Ed25519KeyIdentity.generate();
	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer =>
			missionControlUserInitArgs(incorrectUser.getPrincipal());

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactorMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		const { canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
			sender: controller.getPrincipal()
		});

		satelliteId = cId;
	});

	beforeEach(() => {
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should throw errors on set satellite because the user of the mission control has been incorrectly set to another identity than the controller', async () => {
		const { set_satellite } = actor;

		await expect(set_satellite(satelliteId, [])).rejects.toThrow(
			MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG
		);
	});
});

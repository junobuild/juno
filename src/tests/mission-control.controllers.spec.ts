import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { ORBITER_CONTROLLER_ERR_MSG } from './constants/orbiter-tests.constants';
import { SATELLITE_ADMIN_ERROR_MSG } from './constants/satellite-tests.constants';
import {
	MISSION_CONTROL_WASM_PATH,
	ORBITER_WASM_PATH,
	SATELLITE_WASM_PATH,
	controllersInitArgs
} from './utils/setup-tests.utils';

describe('Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer =>
			IDL.encode(
				[
					IDL.Record({
						user: IDL.Principal
					})
				],
				[{ user: controller.getPrincipal() }]
			);

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactorMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		const { canisterId } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs([controller.getPrincipal(), missionControlId]),
			sender: controller.getPrincipal()
		});

		orbiterId = canisterId;

		const { canisterId: cId } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
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

		await expect(set_orbiter(orbiterId, ['Hello'])).rejects.toThrowError(
			new RegExp(ORBITER_CONTROLLER_ERR_MSG)
		);
	});

	it('should not be able to set a satellite because mission control is effectively not a controller', async () => {
		const { set_satellite } = actor;

		await expect(set_satellite(satelliteId, ['Hello'])).rejects.toThrowError(
			new RegExp(SATELLITE_ADMIN_ERROR_MSG)
		);
	});
});

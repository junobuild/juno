import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import {
	MISSION_CONTROL_WASM_PATH,
	ORBITER_WASM_PATH,
	controllersInitArgs
} from './utils/setup-tests.utils';

describe('Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let orbiterId: Principal;

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

		const { actor: c } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactorMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		actor = c;

		const { canisterId } = await pic.setupCanister<OrbiterActor>({
			idlFactory: idlFactorOrbiter,
			wasm: ORBITER_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		orbiterId = canisterId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on set orbiter', async () => {
			const { set_orbiter } = actor;

			await expect(set_orbiter(orbiterId, [])).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on unset orbiter', async () => {
			const { unset_orbiter } = actor;

			await expect(unset_orbiter(orbiterId)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	});
});

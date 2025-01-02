import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import { missionControlUserInitArgs } from './utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactorMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testGuards = () => {
		it('should throw errors on get user id', async () => {
			const { get_user_id } = actor;

			await expect(get_user_id()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on get user', async () => {
			const { get_user } = actor;

			await expect(get_user()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on get settings', async () => {
			const { get_settings } = actor;

			await expect(get_settings()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	};

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testGuards();
	});

	describe('user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		testGuards();
	});
});

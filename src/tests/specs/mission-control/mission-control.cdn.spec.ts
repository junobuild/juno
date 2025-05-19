import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { beforeAll, describe, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/mission-control-tests.constants';
import { testControlledCdnMethods, testNotAllowedCdnMethods } from '../../utils/cdn-tests.utils';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Mission Control > Cdn', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const currentDate = new Date(2021, 6, 10, 0, 0, 0, 0);

	const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(currentDate.getTime());

		const { actor: c, canisterId: cId } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactorMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		canisterId = cId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testNotAllowedCdnMethods({ actor: () => actor, errorMsg: CONTROLLER_ERROR_MSG });
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		testNotAllowedCdnMethods({ actor: () => actor, errorMsg: CONTROLLER_ERROR_MSG });
	});

	describe('Admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testControlledCdnMethods({ actor: () => actor });
	});
});

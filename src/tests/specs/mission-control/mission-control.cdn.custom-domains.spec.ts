import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { inject } from 'vitest';
import { MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG } from '../../constants/mission-control-tests.constants';
import {
	adminCustomDomainsTests,
	adminCustomDomainsWithProposalTests,
	anonymousCustomDomainsTests
} from '../../utils/custom-domains-tests.utils';
import { missionControlUserInitArgs } from '../../utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Mission Control > Cdn > Custom Domains', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	const controller = Ed25519KeyIdentity.generate();

	const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactorMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		anonymousCustomDomainsTests({
			actor: () => actor,
			errorMsg: MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG
		});
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		adminCustomDomainsTests({ actor: () => actor });

		adminCustomDomainsWithProposalTests({ actor: () => actor });
	});
});

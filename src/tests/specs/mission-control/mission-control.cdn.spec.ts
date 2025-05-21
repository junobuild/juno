import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { beforeAll, describe, expect, inject } from 'vitest';
import {
	MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG,
	MISSION_CONTROL_CONTROLLER_ERROR_MSG
} from '../../constants/mission-control-tests.constants';
import {
	testCdnConfig,
	testCdnGetProposal,
	testControlledCdnMethods,
	testNotAllowedCdnMethods
} from '../../utils/cdn-assertions-tests.utils';
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

		await pic.updateCanisterSettings({
			canisterId: cId,
			controllers: [controller.getPrincipal(), cId],
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		canisterId = cId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testNotAllowedCdnMethodsInMissionControl = ({
		actor,
		errorMsg
	}: {
		actor: () => Actor<MissionControlActor | ConsoleActor>;
		errorMsg: string;
	}) => {
		it('should throw errors on get proposal', async () => {
			const { get_proposal } = actor();

			await expect(get_proposal(1n)).rejects.toThrow(errorMsg);
		});
	};

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testNotAllowedCdnMethods({
			actor: () => actor,
			errorMsgAdminController: MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG,
			errorMsgController: MISSION_CONTROL_CONTROLLER_ERROR_MSG
		});

		testNotAllowedCdnMethodsInMissionControl({
			actor: () => actor,
			errorMsg: MISSION_CONTROL_CONTROLLER_ERROR_MSG
		});
	});

	describe('Some identity', () => {
		beforeAll(() => {
			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		testNotAllowedCdnMethods({
			actor: () => actor,
			errorMsgAdminController: MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG,
			errorMsgController: MISSION_CONTROL_CONTROLLER_ERROR_MSG
		});

		testNotAllowedCdnMethodsInMissionControl({
			actor: () => actor,
			errorMsg: MISSION_CONTROL_CONTROLLER_ERROR_MSG
		});
	});

	describe('Admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testCdnConfig({
			actor: () => actor
		});

		testControlledCdnMethods({
			actor: () => actor,
			currentDate,
			canisterId: () => canisterId,
			caller: () => controller,
			pic: () => pic
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});
	});

	describe('Read+write controller', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_mission_control_controllers } = actor;

			await set_mission_control_controllers([user.getPrincipal()], {
				scope: { Write: null },
				metadata: [],
				expires_at: []
			});

			actor.setIdentity(user);
		});

		beforeEach(() => {
			actor.setIdentity(user);
		});

		testControlledCdnMethods({
			actor: (params) => {
				if (params?.requireController === true) {
					actor.setIdentity(controller);
				} else {
					actor.setIdentity(user);
				}

				return actor;
			},
			currentDate,
			canisterId: () => canisterId,
			caller: () => user,
			pic: () => pic,
			expected_proposal_id: 5n
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => user,
			proposalId: 5n
		});

		testCdnGetProposal({
			actor: () => actor,
			owner: () => controller
		});

		it('should fail at committing a proposal', async () => {
			const { commit_proposal } = actor;

			await expect(
				commit_proposal({
					sha256: Array.from({ length: 32 }).map((_, i) => i),
					proposal_id: 5n
				})
			).rejects.toThrow(MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on delete proposal assets', async () => {
			const { delete_proposal_assets } = actor;

			await expect(delete_proposal_assets({ proposal_ids: [1n] })).rejects.toThrow(
				MISSION_CONTROL_ADMIN_CONTROLLER_ERROR_MSG
			);
		});
	});
});

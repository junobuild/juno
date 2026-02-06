import {
	idlFactoryMissionControl,
	type MissionControlActor,
	type MissionControlDid
} from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { type Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish } from '@dfinity/utils';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY,
	JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
	JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST
} from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../constants/controller-tests.constants';
import { missionControlUserInitArgs } from '../../../utils/mission-control-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Mission Control > Controllers', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	const controller = Ed25519KeyIdentity.generate();

	const metadata: [string, string][] = [['email', 'test@test.com']];

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): Uint8Array => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactoryMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		// Mission Control needs to control itself to be able to set_mission_control_controllers
		await pic.updateCanisterSettings({
			canisterId,
			controllers: [controller.getPrincipal(), canisterId],
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should add and remove additional controller', async () => {
		const {
			set_mission_control_controllers,
			list_mission_control_controllers,
			del_mission_control_controllers
		} = actor;

		const newController = Ed25519KeyIdentity.generate();

		const controllerData: MissionControlDid.SetController = {
			scope: { Admin: null },
			expires_at: [],
			kind: [{ Automation: null }],
			metadata: [['hello', 'world']]
		};

		await set_mission_control_controllers([newController.getPrincipal()], controllerData);

		const addControllers = await list_mission_control_controllers();

		expect(addControllers).toHaveLength(1);

		const newAddedController = addControllers.find(
			([p]) => p.toText() === newController.getPrincipal().toText()
		);

		assertNonNullish(newAddedController);

		expect(newAddedController[1].metadata).toEqual(controllerData.metadata);
		expect(newAddedController[1].scope).toEqual(controllerData.scope);
		expect(newAddedController[1].expires_at).toEqual(controllerData.expires_at);
		expect(newAddedController[1].kind).toEqual(controllerData.kind);

		await del_mission_control_controllers([newController.getPrincipal()]);

		const updatedControllers = await list_mission_control_controllers();

		expect(updatedControllers).toHaveLength(0);
	});

	describe('assert', () => {
		it('should throw errors on creating admin controller with expiration date', async () => {
			const { set_mission_control_controllers } = actor;

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_mission_control_controllers([controller.getPrincipal()], {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY);
		});

		it.each([
			{ title: 'write', scope: { Write: null } },
			{ title: 'submit', scope: { Submit: null } }
		])(
			'should throw errors on creating controller with expiry in the past for $title',
			async ({ scope }) => {
				const { set_mission_control_controllers } = actor;

				const controller = Ed25519KeyIdentity.generate();

				const now = toBigIntNanoSeconds(new Date(await pic.getTime()));

				await pic.advanceTime(10_000);
				await tick(pic);

				await expect(
					set_mission_control_controllers([controller.getPrincipal()], {
						...CONTROLLER_METADATA,
						scope,
						expires_at: [now]
					})
				).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST);
			}
		);

		it('should throw errors on creating anonymous controller', async () => {
			const { set_mission_control_controllers } = actor;

			const controller = new AnonymousIdentity();

			await expect(
				set_mission_control_controllers([controller.getPrincipal()], {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED);
		});
	});
});

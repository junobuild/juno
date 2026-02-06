import {
	idlFactoryMissionControl,
	idlFactoryOrbiter,
	type MissionControlActor,
	type OrbiterActor
} from '$declarations';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { PocketIc, type Actor } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import {
	JUNO_ERROR_CONTROLLERS_ADMIN_NO_EXPIRY,
	JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED,
	JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST
} from '@junobuild/errors';
import { inject } from 'vitest';
import { CONTROLLER_METADATA } from '../../../constants/controller-tests.constants';
import { ORBITER_CONTROLLER_ERR_MSG } from '../../../constants/orbiter-tests.constants';
import { missionControlUserInitArgs } from '../../../utils/mission-control-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
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

	describe('assert', () => {
		it('should throw errors on creating admin controller with expiration date', async () => {
			const { set_orbiters_controllers } = actor;

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_orbiters_controllers([orbiterId], [controller.getPrincipal()], {
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
				const { set_orbiters_controllers } = actor;

				const controller = Ed25519KeyIdentity.generate();

				const now = toBigIntNanoSeconds(new Date(await pic.getTime()));

				await pic.advanceTime(10_000);
				await tick(pic);

				await expect(
					set_orbiters_controllers([orbiterId], [controller.getPrincipal()], {
						...CONTROLLER_METADATA,
						scope,
						expires_at: [now]
					})
				).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_EXPIRY_IN_PAST);
			}
		);

		it('should throw errors on creating anonymous controller', async () => {
			const { set_orbiters_controllers } = actor;

			const controller = new AnonymousIdentity();

			await expect(
				set_orbiters_controllers([orbiterId], [controller.getPrincipal()], {
					...CONTROLLER_METADATA,
					scope: { Admin: null },
					expires_at: [1n]
				})
			).rejects.toThrowError(JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED);
		});
	});
});
